"use client";

import { useState, useEffect, useRef } from "react";
import {
  ExternalLink, Copy, Check, FileText,
  ChevronDown, ChevronUp, BookMarked, Wand2,
  CheckCircle2, AlertCircle, Square, CheckSquare, Search, Star,
} from "lucide-react";
import type { Paper } from "@/app/api/references/route";

interface ReferencesPanelProps {
  papers: Paper[];
  topics: string[];
  loading: boolean;
  sufficient?: boolean;
  existingCitationCount?: number;
  hasReferenceList?: boolean;
  gaps?: string[];
  onInsertCitations?: (selectedPapers: Paper[]) => void;
  inserting?: boolean;
  onSearchMore?: (query: string) => Promise<void>;
}

interface PaperCardProps {
  paper: Paper;
  selected: boolean;
  onToggle: () => void;
}

function PaperCard({ paper, selected, onToggle }: PaperCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paper.apaCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAuthors =
    paper.authors.length === 0
      ? "Unknown Author"
      : paper.authors.length <= 3
      ? paper.authors.join(", ")
      : `${paper.authors[0]} et al.`;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-150 ${
      selected
        ? "bg-white border-indigo-300 shadow-sm"
        : "bg-gray-50 border-gray-200 opacity-60"
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className="flex-shrink-0 mt-0.5 text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors"
            title={selected ? "Deselect this paper" : "Select this paper"}
          >
            {selected
              ? <CheckSquare className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              : <Square className="w-[18px] h-[18px] text-gray-300" />
            }
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {paper.pdfUrl ? (
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 hover:underline leading-snug block cursor-pointer"
                  >
                    {paper.title}
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-indigo-700 leading-snug">{paper.title}</p>
                )}
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {displayAuthors}
                  {paper.year ? ` · ${paper.year}` : ""}
                  {paper.journal ? ` · ${paper.journal}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {paper.citationCount > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {paper.citationCount.toLocaleString()} citations
                  </span>
                )}
                {paper.pdfUrl ? (
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <FileText className="w-3 h-3" />
                    Open PDF
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                    Open access
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                <BookMarked className="w-3 h-3" />
                Re: {paper.relevantFor}
              </span>
              {paper.paperId.startsWith("oa:") && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">OpenAlex</span>
              )}
              {paper.paperId.startsWith("arxiv:") && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">arXiv</span>
              )}
              {!paper.paperId.startsWith("oa:") && !paper.paperId.startsWith("arxiv:") && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Semantic Scholar</span>
              )}
              {paper.relevanceScore !== undefined && paper.relevanceScore >= 65 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Recommended · {paper.relevanceScore}%
                </span>
              )}
            </div>
            {paper.relevanceScore !== undefined && paper.relevanceScore >= 65 && paper.recommendedReason && (
              <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
                {paper.recommendedReason}
              </p>
            )}
          </div>
        </div>
      </div>

      {paper.abstract && (
        <div className="border-t border-indigo-50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-indigo-500 hover:bg-indigo-50/40 transition-colors cursor-pointer"
          >
            <span>Abstract</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {expanded && (
            <p className="px-4 pb-3 text-xs text-gray-500 leading-relaxed border-t border-indigo-50">
              {paper.abstract}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-indigo-50 bg-indigo-50/30 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-gray-600 leading-relaxed flex-1 font-mono select-all">
            {paper.apaCitation}
          </p>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy APA"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Citation status banner ───────────────────────────────────────────────────

function CitationStatusBanner({
  existingCitationCount,
  hasReferenceList,
}: {
  existingCitationCount?: number;
  hasReferenceList?: boolean;
}) {
  const count = existingCitationCount ?? 0;
  const hasList = hasReferenceList ?? false;

  if (count === 0 && hasList) {
    return (
      <div className="mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800">Reference list found, but no in-text citations</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Your document has a References section at the end, but none of those sources are cited within the body text using <span className="font-mono">(Author, Year)</span> format. Every claim that relies on a source needs an in-text citation — a reference list alone is not sufficient.
          </p>
        </div>
      </div>
    );
  }

  if (count === 0 && !hasList) {
    return (
      <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-red-700">
          <span className="font-semibold">No citations found at all.</span> Your text has no in-text citations and no reference list. Academic writing requires sources for factual claims.
        </p>
      </div>
    );
  }

  if (count > 0 && !hasList) {
    return (
      <div className="mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Found <span className="font-semibold">{count} in-text citation{count !== 1 ? "s" : ""}</span> but no References section at the end. APA 7 requires a full reference list.
        </p>
      </div>
    );
  }

  return null; // count > 0 && hasList — fine, no banner needed
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ReferencesPanel({
  papers,
  topics,
  loading,
  sufficient,
  existingCitationCount,
  hasReferenceList,
  gaps,
  onInsertCitations,
  inserting,
  onSearchMore,
}: ReferencesPanelProps) {
  const [allCopied, setAllCopied] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // When papers load or change, select all by default
  useEffect(() => {
    setSelectedIds(new Set(papers.map((p) => p.paperId)));
  }, [papers]);

  const selectedPapers = papers.filter((p) => selectedIds.has(p.paperId));
  const allSelected = selectedIds.size === papers.length && papers.length > 0;

  const togglePaper = (paperId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(paperId)) next.delete(paperId);
      else next.add(paperId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(papers.map((p) => p.paperId)));
  };

  const handleSearchMore = async () => {
    const q = searchQuery.trim();
    if (!q || !onSearchMore || searching) return;
    setSearching(true);
    try {
      await onSearchMore(q);
      setSearchQuery("");
    } finally {
      setSearching(false);
    }
  };

  const handleCopyAll = async () => {
    const allCitations = papers.map((p) => p.apaCitation).join("\n\n");
    await navigator.clipboard.writeText("References\n\n" + allCitations);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2500);
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-indigo-950" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Checking Your Citations…
          </h2>
        </div>
        <p className="text-xs text-gray-400">Scanning for existing citations · identifying gaps · searching Semantic Scholar</p>
      </div>
    );
  }

  // ── Sufficient ───────────────────────────────────────────────────────────

  if (sufficient) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-indigo-950" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              Citations Look Sufficient
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Found <span className="font-semibold text-indigo-700">{existingCitationCount} in-text citation{existingCitationCount !== 1 ? "s" : ""}</span>
              {hasReferenceList ? " with a References section" : ""} — your content appears adequately supported. No additional references needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── No papers found ──────────────────────────────────────────────────────

  if (papers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 animate-fade-in">
        <CitationStatusBanner existingCitationCount={existingCitationCount} hasReferenceList={hasReferenceList} />
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-indigo-950 mb-1" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              Citations Needed — No Open-Access Papers Found
            </h2>
            <p className="text-sm text-gray-500">
              Semantic Scholar didn&apos;t return open-access results for your topic. Try adding citations manually from Google Scholar or your institution&apos;s database.
            </p>
          </div>
        </div>
        {gaps && gaps.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Claims that need citations:</p>
            <div className="space-y-1.5">
              {gaps.map((gap, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <span className="font-bold flex-shrink-0">{i + 1}.</span>
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Papers found ─────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in">
      {/* Citation status banner */}
      <CitationStatusBanner existingCitationCount={existingCitationCount} hasReferenceList={hasReferenceList} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-indigo-950" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            References Found
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {papers.length} open-access paper{papers.length !== 1 ? "s" : ""} ·{" "}
            <button onClick={toggleAll} className="text-indigo-500 hover:text-indigo-700 underline cursor-pointer">
              {allSelected ? "deselect all" : "select all"}
            </button>
            {selectedIds.size > 0 && selectedIds.size < papers.length && (
              <span className="ml-1 font-medium text-indigo-600">· {selectedIds.size} selected</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onInsertCitations && (
            <button
              onClick={() => onInsertCitations(selectedPapers)}
              disabled={inserting || selectedPapers.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {inserting ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Inserting…</>
              ) : (
                <><Wand2 className="w-3.5 h-3.5" />Insert {selectedPapers.length} Selected Citation{selectedPapers.length !== 1 ? "s" : ""}</>
              )}
            </button>
          )}
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
          >
            {allCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {allCopied ? "Copied All!" : "Copy All Citations"}
          </button>
        </div>
      </div>

      {/* Gap chips */}
      {gaps && gaps.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-2">Claims that needed citations:</p>
          <div className="space-y-1.5">
            {gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="font-bold flex-shrink-0">{i + 1}.</span>
                <span>{gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic chips */}
      {topics.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-400">Searched for:</span>
          {topics.map((t, i) => (
            <span key={i} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Paper cards */}
      {(() => {
        const recommended = papers.filter(p => p.relevanceScore !== undefined && p.relevanceScore >= 65);
        const others = papers.filter(p => p.relevanceScore === undefined || p.relevanceScore < 65);
        return (
          <div className="space-y-3">
            {recommended.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-700">Recommended for your content ({recommended.length})</span>
                  <div className="flex-1 h-px bg-amber-100" />
                </div>
                {recommended.map((paper) => (
                  <PaperCard
                    key={paper.paperId}
                    paper={paper}
                    selected={selectedIds.has(paper.paperId)}
                    onToggle={() => togglePaper(paper.paperId)}
                  />
                ))}
              </>
            )}
            {others.length > 0 && (
              <>
                {recommended.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-gray-400">Other relevant papers ({others.length})</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                )}
                {others.map((paper) => (
                  <PaperCard
                    key={paper.paperId}
                    paper={paper}
                    selected={selectedIds.has(paper.paperId)}
                    onToggle={() => togglePaper(paper.paperId)}
                  />
                ))}
              </>
            )}
          </div>
        );
      })()}

      {/* Search for more */}
      {onSearchMore && (
        <div className="mt-4 bg-white border border-indigo-100 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-indigo-700 mb-2">Search for more papers</p>
          <p className="text-xs text-gray-400 mb-3">
            Type a specific topic, claim, or keyword — searches Semantic Scholar, OpenAlex, and arXiv simultaneously.
          </p>
          <div className="flex gap-2">
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchMore()}
              placeholder="e.g. ChatGPT reinforcement learning cybersecurity"
              className="flex-1 text-xs rounded-lg border border-indigo-200 bg-indigo-50/30 px-3 py-2 text-indigo-950 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
            />
            <button
              onClick={handleSearchMore}
              disabled={!searchQuery.trim() || searching}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {searching
                ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Search className="w-3.5 h-3.5" />
              }
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400">Sources:</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Semantic Scholar</span>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">OpenAlex</span>
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">arXiv</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <ExternalLink className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Always read each paper before citing it. Confirm it supports your specific argument. You are responsible for how you use these sources.
        </p>
      </div>
    </div>
  );
}
