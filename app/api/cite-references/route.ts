import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Paper } from "@/app/api/references/route";

const client = new Anthropic();

function buildInTextKey(paper: Paper): string {
  if (paper.authors.length === 0) return `(Unknown, ${paper.year ?? "n.d."})`;
  const last = paper.authors[0].trim().split(" ").pop() ?? paper.authors[0];
  if (paper.authors.length === 1) return `(${last}, ${paper.year ?? "n.d."})`;
  if (paper.authors.length === 2) {
    const last2 = paper.authors[1].trim().split(" ").pop() ?? paper.authors[1];
    return `(${last} & ${last2}, ${paper.year ?? "n.d."})`;
  }
  return `(${last} et al., ${paper.year ?? "n.d."})`;
}

export async function POST(req: NextRequest) {
  try {
    const { text, papers }: { text: string; papers: Paper[] } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response("Text required", { status: 400 });
    }
    if (!Array.isArray(papers) || papers.length === 0) {
      return new Response("Papers list required", { status: 400 });
    }

    // Build a numbered reference list for the prompt
    const paperList = papers
      .map((p, i) => {
        const inText = buildInTextKey(p);
        const shortAbstract = p.abstract ? p.abstract.slice(0, 150) : "No abstract available";
        return `[REF${i + 1}] In-text citation: ${inText}\nTitle: ${p.title}\nRelevant for claim about: ${p.relevantFor}\nAbstract snippet: ${shortAbstract}\nFull APA: ${p.apaCitation}`;
      })
      .join("\n\n");

    const systemPrompt = `You are an APA 7 academic writing expert. A student has found academic papers and wants you to insert them as proper citations into their essay.

TASK:
1. Read the student essay carefully, sentence by sentence
2. For each sentence that makes a factual claim, finding, or argument that one of the provided papers supports — insert an in-text citation immediately after that sentence (before the period if at sentence end, or at a natural pause)
3. Where multiple papers support the same claim, cite both: (Smith, 2020; Jones, 2021)
4. After the essay body, add a blank line then "References" as a heading, then list only the papers you actually cited, in alphabetical order by first author surname, in APA 7 format
5. Do NOT change, rephrase, or rewrite any of the student's original words — only insert citations
6. Do NOT cite a paper for a sentence where it clearly does not apply
7. Do NOT invent citations not in the provided list

APA 7 in-text formats:
- Parenthetical: ends the sentence → sentence text (Author, Year).
- Narrative: Author (Year) found/argued/noted that...
- Multiple: (Author A, Year; Author B, Year) — alphabetical order

OUTPUT: The full essay text with citations inserted, followed by the References section. Nothing else — no preamble, no explanation.`;

    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: systemPrompt,
      stream: true,
      messages: [
        {
          role: "user",
          content: `Available papers:\n\n${paperList}\n\n---\n\nStudent essay (insert citations where appropriate):\n\n${text}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Cite references error:", err);
    return new Response("Citation insertion failed", { status: 500 });
  }
}
