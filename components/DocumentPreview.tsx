"use client";

import { useState } from "react";
import { Eye, Code } from "lucide-react";

interface DocumentPreviewProps {
  html: string;
  textWithPlaceholders: string;
}

export function DocumentPreview({ html, textWithPlaceholders }: DocumentPreviewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "text">("preview");

  return (
    <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-indigo-100 px-4 py-2 bg-indigo-50/40">
        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Document Preview</span>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer
              ${viewMode === "preview" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-indigo-600"}`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={() => setViewMode("text")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer
              ${viewMode === "text" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-indigo-600"}`}
          >
            <Code className="w-3.5 h-3.5" /> Plain Text
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {viewMode === "preview" ? (
          <div
            className="document-preview p-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="p-5 text-[13px] text-indigo-950 leading-relaxed whitespace-pre-wrap font-sans">
            {textWithPlaceholders}
          </pre>
        )}
      </div>

      <style>{`
        .document-preview {
          font-family: 'Times New Roman', Times, serif;
          font-size: 14px;
          line-height: 1.8;
          color: #1a1a1a;
        }
        /* Respect mammoth's inline text-align; only indent paragraphs that are left-aligned body text */
        .document-preview p {
          margin: 0 0 0.6em 0;
        }
        /* Indent only paragraphs WITHOUT an explicit alignment — mammoth sets style="text-align:..." on centered/right paragraphs */
        .document-preview p:not([style*="text-align"]) {
          text-indent: 0.5in;
        }
        .document-preview h1, .document-preview h2, .document-preview h3 {
          font-weight: bold;
          margin: 1em 0 0.5em 0;
          text-indent: 0;
        }
        .document-preview h1 { font-size: 16px; text-align: center; }
        .document-preview h2 { font-size: 15px; }
        .document-preview h3 { font-size: 14px; font-style: italic; }
        .document-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          font-size: 13px;
        }
        .document-preview table td,
        .document-preview table th {
          border: 1px solid #555;
          padding: 6px 10px;
          text-align: center;
        }
        .document-preview table th {
          font-weight: bold;
          background: #f5f5f5;
        }
        .document-preview ul, .document-preview ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        .document-preview strong { font-weight: bold; }
        .document-preview em { font-style: italic; }
      `}</style>
    </div>
  );
}
