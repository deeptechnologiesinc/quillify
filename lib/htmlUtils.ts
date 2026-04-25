import { parse as parseHtml } from "node-html-parser";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableData {
  index: number;       // 1-based counter (TABLE_1, TABLE_2 …)
  rows: string[][];    // rows[rowIdx][colIdx] = cell text
  isFirstRowHeader: boolean;
  captionText: string | null; // paragraph immediately before or after the table
}

export interface ParsedDoc {
  textWithPlaceholders: string; // prose text, tables replaced with [TABLE_1] etc.
  tables: TableData[];
  rawHtml: string;
}

// ─── HTML → ParsedDoc ─────────────────────────────────────────────────────────

export function parseDocHtml(html: string): ParsedDoc {
  const root = parseHtml(html);
  const tables: TableData[] = [];
  let tableCount = 0;
  const textParts: string[] = [];

  const topNodes = root.childNodes;

  for (let i = 0; i < topNodes.length; i++) {
    const node = topNodes[i];
    const tag = (node as { tagName?: string }).tagName?.toLowerCase() ?? "";

    if (tag === "table") {
      tableCount++;
      const rows: string[][] = [];
      let isFirstRowHeader = false;

      const trNodes = (node as ReturnType<typeof parseHtml>).querySelectorAll("tr");
      trNodes.forEach((tr, rowIdx) => {
        const cells: string[] = [];
        const tdNodes = tr.querySelectorAll("td, th");
        tdNodes.forEach((td) => {
          const isHeader = td.tagName?.toLowerCase() === "th";
          if (rowIdx === 0 && isHeader) isFirstRowHeader = true;
          cells.push(decodeEntities(td.innerText.trim()));
        });
        if (cells.length > 0) rows.push(cells);
      });

      // Look for a caption in the next sibling paragraph
      let captionText: string | null = null;
      const next = topNodes[i + 1];
      const nextTag = (next as { tagName?: string })?.tagName?.toLowerCase();
      if (nextTag === "p") {
        const txt = decodeEntities((next as ReturnType<typeof parseHtml>).innerText.trim());
        if (txt && txt.length < 200) {
          captionText = txt;
          i++; // consume the caption node
        }
      }

      tables.push({ index: tableCount, rows, isFirstRowHeader, captionText });
      textParts.push(`\n\n[TABLE_${tableCount}]\n\n`);
    } else if (tag.match(/^h[1-6]$/)) {
      const text = decodeEntities((node as ReturnType<typeof parseHtml>).innerText.trim());
      if (text) textParts.push(`\n${text}\n`);
    } else if (tag === "p") {
      const text = decodeEntities((node as ReturnType<typeof parseHtml>).innerText.trim());
      if (text) textParts.push(text);
    } else if (tag === "ul" || tag === "ol") {
      (node as ReturnType<typeof parseHtml>).querySelectorAll("li").forEach((li) => {
        const text = decodeEntities(li.innerText.trim());
        if (text) textParts.push(`- ${text}`);
      });
    }
  }

  const textWithPlaceholders = textParts
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { textWithPlaceholders, tables, rawHtml: html };
}

// ─── Plain text extraction (for .txt files) ───────────────────────────────────

export function htmlToPlainText(html: string): string {
  const root = parseHtml(html);
  return decodeEntities(root.innerText)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── HTML entity decoder ──────────────────────────────────────────────────────

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/ /g, " ");
}
