import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface Paper {
  paperId: string;
  title: string;
  authors: string[];
  year: number | null;
  journal: string | null;
  abstract: string | null;
  pdfUrl: string | null;
  doi: string | null;
  citationCount: number;
  relevantFor: string;
  apaCitation: string;
  relevanceScore?: number;    // 0-100, scored against user's specific content
  recommendedReason?: string; // one sentence: which claim this supports
}

export interface RefCheckResult {
  existingCitationCount: number;
  hasReferenceList: boolean;
  sufficient: boolean;
  gaps: string[]; // specific uncited claims for display
}

// ─── Step 1a: Analyse what citations already exist and what gaps remain ──────

async function analyzeExistingRefs(text: string): Promise<RefCheckResult> {
  // Send beginning + end so we never slice off the References section
  const sample =
    text.length > 6000
      ? text.slice(0, 3500) + "\n\n[...middle omitted...]\n\n" + text.slice(-2500)
      : text;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: `You are an academic writing expert checking citation coverage.

Return a JSON object with:
- existingCitationCount: number — count every in-text citation: (Author, Year), Author (Year), (Author et al., Year), (Author & Author, Year). Also count numbered citations like [1] or footnote markers if present.
- hasReferenceList: boolean — true if a "References", "Bibliography", or "Works Cited" section appears anywhere in the text (including at the end)
- sufficient: boolean — true ONLY if every major factual claim, statistic, and research finding has an in-text citation. If hasReferenceList is true but existingCitationCount > 3, lean toward sufficient=true unless obvious uncited claims exist.
- gaps: string[] — specific claims or statistics with NO in-text citation nearby (max 5, be concise e.g. "LLM threat detection claim uncited", "ChatGPT comparison stat needs source"). Empty array if sufficient.

Return ONLY the JSON, no commentary.`,
    messages: [{
      role: "user",
      content: `Check citation coverage:\n\n${sample}`,
    }],
  });

  const content = msg.content[0];
  if (content.type !== "text") throw new Error("No content from Claude");
  const match = content.text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse citation analysis");
  try {
    return JSON.parse(match[0]) as RefCheckResult;
  } catch {
    throw new Error("Invalid JSON from citation analysis");
  }
}

// ─── Step 1b: Extract broad academic search queries (separate from gap check) ─

async function extractBroadTopics(text: string): Promise<string[]> {
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system: `Extract academic search queries from a student essay. These will be sent to Semantic Scholar to find real papers.

Return ONLY a JSON array of 8-10 queries (2-4 words each).
CRITICAL rules:
- Use BROAD standard academic terms that appear in published paper titles
- GOOD: "large language models security", "AI cybersecurity automation", "machine learning threat detection"
- BAD: "LLMs increasingly integrated cybersecurity threat analysis incident response"
- Mix topic-level queries with technology/concept queries
- Shorter queries (2-3 words) find more results than long specific phrases

Return ONLY the JSON array, nothing else.`,
    messages: [{
      role: "user",
      content: `Extract search queries:\n\n${text.slice(0, 3000)}`,
    }],
  });

  const content = msg.content[0];
  if (content.type !== "text") return [];
  const match = content.text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    return (JSON.parse(match[0]) as string[]).slice(0, 10);
  } catch {
    return [];
  }
}

// ─── Search engines ───────────────────────────────────────────────────────────

async function searchSemanticScholar(query: string): Promise<Paper[]> {
  const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "10");
  url.searchParams.set("fields", "paperId,title,authors,year,journal,abstract,isOpenAccess,openAccessPdf,externalIds,citationCount");

  const res = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.data) return [];

  const papers: Paper[] = [];
  for (const p of data.data) {
    if (!p.isOpenAccess || !p.title || !p.year) continue;
    const authors: string[] = (p.authors || []).map((a: { name: string }) => a.name);
    const doi = p.externalIds?.DOI || null;
    const journal = p.journal?.name || null;
    const pdfUrl: string | null = p.openAccessPdf?.url || null;

    papers.push({
      paperId: p.paperId,
      title: p.title,
      authors,
      year: p.year,
      journal,
      abstract: p.abstract ? p.abstract.slice(0, 320) + (p.abstract.length > 320 ? "…" : "") : null,
      pdfUrl,
      doi,
      citationCount: p.citationCount || 0,
      relevantFor: query,
      apaCitation: buildApaCitation(authors, p.year, p.title, journal, doi, pdfUrl),
    });
  }
  return papers;
}

async function searchOpenAlex(query: string): Promise<Paper[]> {
  const url = new URL("https://api.openalex.org/works");
  url.searchParams.set("search", query);
  url.searchParams.set("filter", "is_oa:true");
  url.searchParams.set("per_page", "8");
  url.searchParams.set("select", "id,doi,title,authorships,publication_year,primary_location,open_access,cited_by_count,abstract_inverted_index");

  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json", "User-Agent": "Quillify/1.0 (academic-writing-assistant)" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results) return [];

  const papers: Paper[] = [];
  for (const w of data.results) {
    if (!w.title || !w.publication_year) continue;
    const authors: string[] = (w.authorships || []).map(
      (a: { author: { display_name: string } }) => a.author?.display_name ?? ""
    ).filter(Boolean);
    const doi = w.doi ? w.doi.replace("https://doi.org/", "") : null;
    const journal = w.primary_location?.source?.display_name || null;
    const pdfUrl: string | null = w.open_access?.oa_url || null;
    const abstract = reconstructOpenAlexAbstract(w.abstract_inverted_index);

    papers.push({
      paperId: `oa:${w.id?.replace("https://openalex.org/", "") ?? Math.random()}`,
      title: w.title,
      authors,
      year: w.publication_year,
      journal,
      abstract,
      pdfUrl,
      doi,
      citationCount: w.cited_by_count || 0,
      relevantFor: query,
      apaCitation: buildApaCitation(authors, w.publication_year, w.title, journal, doi, pdfUrl),
    });
  }
  return papers;
}

function reconstructOpenAlexAbstract(invertedIndex: Record<string, number[]> | null): string | null {
  if (!invertedIndex) return null;
  const words: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) words.push([pos, word]);
  }
  words.sort((a, b) => a[0] - b[0]);
  const text = words.map(([, w]) => w).join(" ");
  return text.slice(0, 320) + (text.length > 320 ? "…" : "");
}

async function searchArxiv(query: string): Promise<Paper[]> {
  const url = new URL("https://export.arxiv.org/api/query");
  url.searchParams.set("search_query", `all:${query}`);
  url.searchParams.set("max_results", "6");
  url.searchParams.set("sortBy", "relevance");

  const res = await fetch(url.toString(), { headers: { "Accept": "application/xml" } });
  if (!res.ok) return [];
  const xml = await res.text();

  const papers: Paper[] = [];
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

  for (const entry of entries) {
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim().replace(/\s+/g, " ") ?? "";
    const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim().replace(/\s+/g, " ") ?? "";
    const idRaw = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() ?? "";
    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() ?? "";
    const authorMatches = [...entry.matchAll(/<name>([\s\S]*?)<\/name>/g)];

    if (!title || !idRaw) continue;

    const arxivId = idRaw.replace(/^https?:\/\/arxiv\.org\/abs\//, "");
    const year = published ? parseInt(published.slice(0, 4)) : null;
    const authors = authorMatches.map((m) => m[1].trim());

    papers.push({
      paperId: `arxiv:${arxivId}`,
      title,
      authors,
      year,
      journal: "arXiv preprint",
      abstract: summary.slice(0, 320) + (summary.length > 320 ? "…" : ""),
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
      doi: null,
      citationCount: 0,
      relevantFor: query,
      apaCitation: buildApaCitation(authors, year, title, "arXiv preprint", null, `https://arxiv.org/abs/${arxivId}`),
    });
  }
  return papers;
}

// ─── APA 7 citation builder ───────────────────────────────────────────────────

function buildApaCitation(
  authors: string[],
  year: number | null,
  title: string,
  journal: string | null,
  doi: string | null,
  pdfUrl: string | null
): string {
  const formatAuthor = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length < 2) return name;
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map((p) => p.charAt(0).toUpperCase() + ".").join(" ");
    return `${last}, ${initials}`;
  };

  let authorStr = "";
  if (authors.length === 0) {
    authorStr = "Unknown Author";
  } else if (authors.length === 1) {
    authorStr = formatAuthor(authors[0]);
  } else if (authors.length === 2) {
    authorStr = `${formatAuthor(authors[0])}, & ${formatAuthor(authors[1])}`;
  } else if (authors.length <= 20) {
    const all = authors.map(formatAuthor);
    authorStr = all.slice(0, -1).join(", ") + ", & " + all[all.length - 1];
  } else {
    const first19 = authors.slice(0, 19).map(formatAuthor).join(", ");
    authorStr = `${first19}, . . . ${formatAuthor(authors[authors.length - 1])}`;
  }

  const sentenceTitle =
    title.charAt(0).toUpperCase() +
    title.slice(1).toLowerCase().replace(/\b(apa|esg|usa|uk|ai|ceo|gdp|nasa|llm|llms|gpt)\b/gi, (m) => m.toUpperCase());

  const yearStr = year ? `(${year})` : "(n.d.)";
  const journalPart = journal ? ` *${journal}*.` : "";
  const doiPart = doi ? ` https://doi.org/${doi}` : pdfUrl ? ` ${pdfUrl}` : "";

  return `${authorStr} ${yearStr}. ${sentenceTitle}.${journalPart}${doiPart}`;
}

// ─── Multi-source search runner with DOI dedup ───────────────────────────────

async function runSearch(queries: string[]): Promise<{ papers: Paper[]; seen: Set<string> }> {
  // Run all three sources in parallel; arXiv only gets top queries to respect rate limits
  const [ssResults, oaResults, axResults] = await Promise.all([
    Promise.allSettled(queries.map(searchSemanticScholar)),
    Promise.allSettled(queries.slice(0, 6).map(searchOpenAlex)),
    Promise.allSettled(queries.slice(0, 3).map(searchArxiv)),
  ]);

  const seen = new Set<string>();
  const seenDois = new Set<string>();
  const papers: Paper[] = [];

  const addPaper = (paper: Paper) => {
    if (seen.has(paper.paperId)) return;
    if (paper.doi && seenDois.has(paper.doi.toLowerCase())) return;
    seen.add(paper.paperId);
    if (paper.doi) seenDois.add(paper.doi.toLowerCase());
    papers.push(paper);
  };

  for (const batch of [ssResults, oaResults, axResults]) {
    for (const result of batch) {
      if (result.status !== "fulfilled") continue;
      for (const paper of result.value) addPaper(paper);
    }
  }

  return { papers, seen };
}

// ─── Relevance ranking against user content ───────────────────────────────────

async function rankPapers(
  text: string,
  papers: Paper[]
): Promise<Map<string, { score: number; reason: string }>> {
  if (papers.length === 0) return new Map();

  const paperList = papers
    .slice(0, 15)
    .map((p, i) => `[${i}] "${p.title}" (${p.year ?? "n.d."}) — ${(p.abstract ?? "No abstract.").slice(0, 180)}`)
    .join("\n");

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 500,
    system: `You assess how well academic papers match a student essay.

Return a JSON array for papers with score >= 65:
[{"index": 0, "score": 92, "reason": "Directly supports the claim about LLMs detecting network intrusions"}, ...]

Rules:
- score 90-100: paper directly supports a specific named claim or statistic in the essay
- score 70-89: paper is highly relevant to a main topic or argument
- score 65-69: paper is useful background for the essay's area
- reason: one short sentence naming the specific essay claim or section this helps with
- Return max 5 entries, only score >= 65
- Return ONLY the JSON array`,
    messages: [{
      role: "user",
      content: `Essay excerpt:\n${text.slice(0, 2500)}\n\nPapers:\n${paperList}`,
    }],
  });

  const content = msg.content[0];
  if (content.type !== "text") return new Map();
  const match = content.text.match(/\[[\s\S]*\]/);
  if (!match) return new Map();

  try {
    const rankings: Array<{ index: number; score: number; reason: string }> = JSON.parse(match[0]);
    const result = new Map<string, { score: number; reason: string }>();
    for (const r of rankings) {
      if (typeof r.index === "number" && r.index >= 0 && r.index < papers.length) {
        result.set(papers[r.index].paperId, { score: r.score, reason: r.reason });
      }
    }
    return result;
  } catch {
    return new Map();
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { text, customQuery } = await req.json();

    // Custom search mode — skip pre-check, just search the user's specific query
    if (customQuery && typeof customQuery === "string" && customQuery.trim()) {
      const { papers } = await runSearch([customQuery.trim()]);
      papers.sort((a, b) => b.citationCount - a.citationCount);
      return NextResponse.json({
        papers: papers.slice(0, 8),
        topics: [customQuery.trim()],
        existingCitationCount: undefined,
        hasReferenceList: undefined,
        sufficient: false,
        gaps: [],
        isCustomSearch: true,
      });
    }

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json({ error: "Text too short" }, { status: 400 });
    }

    // Step 1: run citation analysis + broad topic extraction in parallel
    const [check, broadQueries] = await Promise.all([
      analyzeExistingRefs(text),
      extractBroadTopics(text),
    ]);

    // Step 2: if already sufficient, return early
    if (check.sufficient) {
      return NextResponse.json({
        papers: [],
        topics: [],
        existingCitationCount: check.existingCitationCount,
        hasReferenceList: check.hasReferenceList,
        sufficient: true,
        gaps: [],
      });
    }

    // Step 3: search using the BROAD topic queries (not gap-specific narrow phrases)
    if (broadQueries.length === 0) {
      return NextResponse.json({
        papers: [],
        topics: [],
        existingCitationCount: check.existingCitationCount,
        hasReferenceList: check.hasReferenceList,
        sufficient: false,
        gaps: check.gaps,
      });
    }

    let { papers, seen } = await runSearch(broadQueries);

    // Step 4: retry with 2-word simplified queries if still too few results
    if (papers.length < 3) {
      const fallback = broadQueries
        .slice(0, 5)
        .map((q) => q.split(" ").slice(0, 2).join(" "))
        .filter((q, i, arr) => arr.indexOf(q) === i);
      const { papers: extra } = await runSearch(fallback);
      for (const paper of extra) {
        if (seen.has(paper.paperId)) continue;
        seen.add(paper.paperId);
        papers.push(paper);
      }
    }

    // Step 5: rank papers against the user's actual content (runs in parallel with sort)
    const topPapers = papers
      .sort((a, b) => b.citationCount - a.citationCount)
      .slice(0, 12);

    const rankings = await rankPapers(text, topPapers);

    // Annotate papers with relevance scores
    for (const paper of topPapers) {
      const rank = rankings.get(paper.paperId);
      if (rank) {
        paper.relevanceScore = rank.score;
        paper.recommendedReason = rank.reason;
      }
    }

    // Sort: recommended (score >= 65) first by score, then rest by citation count
    topPapers.sort((a, b) => {
      const aRec = (a.relevanceScore ?? 0) >= 65;
      const bRec = (b.relevanceScore ?? 0) >= 65;
      if (aRec && bRec) return (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
      if (aRec) return -1;
      if (bRec) return 1;
      return b.citationCount - a.citationCount;
    });

    return NextResponse.json({
      papers: topPapers,
      topics: broadQueries,
      existingCitationCount: check.existingCitationCount,
      hasReferenceList: check.hasReferenceList,
      sufficient: false,
      gaps: check.gaps,
    });
  } catch (err) {
    console.error("References error:", err);
    return NextResponse.json({ error: "Failed to find references" }, { status: 500 });
  }
}
