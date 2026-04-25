import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  convertInchesToTwip,
  Packer,
  PageNumber,
  Header,
  NumberFormat,
  WidthType,
  BorderStyle,
  VerticalAlign,
} from "docx";
import { parseDocHtml, type TableData } from "@/lib/htmlUtils";
import { parse as parseHtmlNode } from "node-html-parser";

const FONT = "Times New Roman";
const BODY_SIZE = 24; // 12pt in half-points
const LINE_SPACING = 480; // double spacing in twips
const FIRST_LINE_INDENT = convertInchesToTwip(0.5);
const MARGIN = convertInchesToTwip(1);

// ─── Text run helpers ─────────────────────────────────────────────────────────

function run(text: string, opts: { bold?: boolean; italic?: boolean; size?: number } = {}) {
  return new TextRun({ text, font: FONT, size: opts.size ?? BODY_SIZE, bold: opts.bold, italics: opts.italic });
}

// ─── Parse inline HTML spans into TextRuns ────────────────────────────────────

function spansFromHtml(innerHtml: string): TextRun[] {
  const root = parseHtmlNode(innerHtml);
  const runs: TextRun[] = [];

  const walk = (node: ReturnType<typeof parseHtmlNode>, bold: boolean, italic: boolean) => {
    const tag = (node as { tagName?: string }).tagName?.toLowerCase() ?? "";
    if (tag === "strong" || tag === "b") {
      node.childNodes.forEach((c) => walk(c as ReturnType<typeof parseHtmlNode>, true, italic));
    } else if (tag === "em" || tag === "i") {
      node.childNodes.forEach((c) => walk(c as ReturnType<typeof parseHtmlNode>, bold, true));
    } else if (!tag) {
      // text node
      const text = (node as { text?: string; rawText?: string }).text ?? (node as { rawText?: string }).rawText ?? "";
      if (text.trim()) runs.push(new TextRun({ text: decodeEntities(text), font: FONT, size: BODY_SIZE, bold, italics: italic }));
    } else {
      node.childNodes.forEach((c) => walk(c as ReturnType<typeof parseHtmlNode>, bold, italic));
    }
  };

  root.childNodes.forEach((c) => walk(c as ReturnType<typeof parseHtmlNode>, false, false));
  return runs.length > 0 ? runs : [run("")];
}

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/ /g, " ");
}

// ─── APA table builder ────────────────────────────────────────────────────────

function buildApaTable(tableData: TableData, tableNumber: number): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // APA table label: "Table N" bold
  elements.push(new Paragraph({
    children: [run(`Table ${tableNumber}`, { bold: true })],
    spacing: { line: LINE_SPACING, before: 240, after: 0 },
  }));

  // APA table title: italicized caption (if any) or generic
  const titleText = tableData.captionText ?? `Table ${tableNumber} Data`;
  elements.push(new Paragraph({
    children: [run(titleText, { italic: true })],
    spacing: { line: LINE_SPACING, before: 0, after: 120 },
  }));

  // Build the table itself
  const docxRows = tableData.rows.map((row, rowIdx) =>
    new TableRow({
      tableHeader: rowIdx === 0 && tableData.isFirstRowHeader,
      children: row.map((cellText) =>
        new TableCell({
          children: [new Paragraph({
            children: [run(cellText, { bold: rowIdx === 0 && tableData.isFirstRowHeader })],
            alignment: AlignmentType.CENTER,
            spacing: { line: 360 },
          })],
          verticalAlign: VerticalAlign.CENTER,
          margins: {
            top: convertInchesToTwip(0.04),
            bottom: convertInchesToTwip(0.04),
            left: convertInchesToTwip(0.08),
            right: convertInchesToTwip(0.08),
          },
        })
      ),
    })
  );

  elements.push(new Table({
    rows: docxRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:              { style: BorderStyle.SINGLE, size: 6, color: "000000" },
      bottom:           { style: BorderStyle.SINGLE, size: 6, color: "000000" },
      left:             { style: BorderStyle.NONE,   size: 0, color: "FFFFFF" },
      right:            { style: BorderStyle.NONE,   size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: "000000" },
      insideVertical:   { style: BorderStyle.NONE,   size: 0, color: "FFFFFF" },
    },
  }));

  // APA note placeholder (optional)
  elements.push(new Paragraph({
    children: [run("Note. ", { italic: true }), run("See text for details.")],
    spacing: { line: LINE_SPACING, before: 60, after: 240 },
  }));

  return elements;
}

// ─── Simple (non-APA, non-HTML) table builder ─────────────────────────────────

function buildSimpleTable(tableData: TableData): Table {
  return new Table({
    rows: tableData.rows.map((row, rowIdx) =>
      new TableRow({
        children: row.map((cellText) =>
          new TableCell({
            children: [new Paragraph({
              children: [run(cellText, { bold: rowIdx === 0 && tableData.isFirstRowHeader })],
              alignment: AlignmentType.CENTER,
            })],
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
          })
        ),
      })
    ),
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ─── Markdown inline parser → TextRun[] ──────────────────────────────────────

function markdownRuns(text: string): TextRun[] {
  const decoded = decodeEntities(text);
  const runs: TextRun[] = [];
  // Match ***bold+italic***, **bold**, *italic*, or plain text
  const re = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(decoded)) !== null) {
    if (m.index > last) runs.push(run(decoded.slice(last, m.index)));
    if (m[1]) runs.push(run(m[1], { bold: true, italic: true }));
    else if (m[2]) runs.push(run(m[2], { bold: true }));
    else if (m[3]) runs.push(run(m[3], { italic: true }));
    last = m.index + m[0].length;
  }
  if (last < decoded.length) runs.push(run(decoded.slice(last)));
  return runs.length ? runs : [run("")];
}

// Strip leading/trailing ** or *** from a line to get the raw heading text
function stripMarkdownBold(line: string): string | null {
  const m = line.match(/^\*{2,3}(.+?)\*{2,3}$/);
  return m ? m[1].trim() : null;
}

// APA 7 Level 1 heading: bold, centered
function apaHeading1(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, { bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { line: LINE_SPACING, before: 240, after: 0 },
  });
}

// APA 7 Level 2 heading: bold, left-aligned (subsections)
function apaHeading2(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, { bold: true })],
    alignment: AlignmentType.LEFT,
    spacing: { line: LINE_SPACING, before: 240, after: 0 },
  });
}

// Known APA Level 1 section names (single-word or standard multi-word)
const APA_L1_HEADINGS = new Set([
  "abstract", "introduction", "methodology", "method", "methods",
  "results", "discussion", "conclusion", "conclusions",
  "limitations", "references", "appendix", "acknowledgements", "acknowledgments",
]);

function classifyHeading(text: string): "l1" | "l2" | null {
  const lower = text.toLowerCase().trim();
  if (APA_L1_HEADINGS.has(lower)) return "l1";
  // Known compound L1 headings
  if (lower.startsWith("edii") || lower.includes("indigenous data")) return "l1";
  // L2: subsection headings (typically title-case phrases not in L1 list)
  return "l2";
}

// ─── Build docx children from processed text + original table data ────────────

function buildChildren(
  processedText: string,
  tables: TableData[],
  isApa: boolean
): (Paragraph | Table)[] {
  const children: (Paragraph | Table)[] = [];
  let inReferences = false;

  // Split processed text on [TABLE_N] placeholders
  const segments = processedText.split(/\[TABLE_(\d+)\]/i);

  for (let i = 0; i < segments.length; i++) {
    if (i % 2 === 0) {
      // Prose segment
      const lines = segments[i].split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        // 0. Markdown horizontal rule → page break
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
          children.push(new Paragraph({ pageBreakBefore: true, text: "" }));
          continue;
        }

        // 1. Full-line markdown bold → APA heading (L1 or L2 based on content)
        const headingText = stripMarkdownBold(line);
        if (headingText) {
          const level = isApa ? classifyHeading(headingText) : "l1";
          if (headingText.toLowerCase() === "references") inReferences = true;
          children.push(level === "l2" ? apaHeading2(headingText) : apaHeading1(headingText));
          continue;
        }

        // 2. Plain-text heading heuristic (for non-markdown output)
        const looksLikeHeading = isApa
          && line.length < 80
          && !line.endsWith(".")
          && !line.endsWith(",")
          && /^[A-Z]/.test(line)
          && line.split(" ").length <= 8;
        if (looksLikeHeading) {
          const level = classifyHeading(line);
          if (line.toLowerCase() === "references") inReferences = true;
          children.push(level === "l2" ? apaHeading2(line) : apaHeading1(line));
          continue;
        }

        // 3. Markdown bullet point → indented paragraph with bullet marker
        const bulletMatch = line.match(/^[-•]\s+(.+)$/);
        if (bulletMatch) {
          children.push(new Paragraph({
            children: [run("•  "), ...markdownRuns(bulletMatch[1])],
            indent: { left: convertInchesToTwip(0.5) },
            spacing: { line: LINE_SPACING, before: 0, after: 0 },
          }));
          continue;
        }

        // 4. Normal paragraph — references get hanging indent, body gets first-line indent
        const indent = inReferences
          ? { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) }
          : (isApa ? { firstLine: FIRST_LINE_INDENT } : undefined);
        children.push(new Paragraph({
          children: markdownRuns(line),
          indent,
          alignment: AlignmentType.LEFT,
          spacing: { line: LINE_SPACING, before: 0, after: 0 },
        }));
      }
    } else {
      // Table placeholder — find the matching table
      const tableIndex = parseInt(segments[i]);
      const tableData = tables.find((t) => t.index === tableIndex);
      if (tableData) {
        if (isApa) {
          buildApaTable(tableData, tableIndex).forEach((el) => children.push(el));
        } else {
          children.push(buildSimpleTable(tableData));
          children.push(new Paragraph({ text: "", spacing: { line: LINE_SPACING } }));
        }
      }
    }
  }

  return children;
}

// ─── HTML-based docx builder (when no AI processing, download original) ───────

function buildChildrenFromHtml(html: string, isApa: boolean): (Paragraph | Table)[] {
  const parsed = parseDocHtml(html);
  return buildChildren(parsed.textWithPlaceholders, parsed.tables, isApa);
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { text, html, mode, title } = await req.json();

    if (!text && !html) {
      return NextResponse.json({ error: "text or html required" }, { status: 400 });
    }

    const isApa = mode === "apa";

    let bodyChildren: (Paragraph | Table)[];

    if (html) {
      // Structured document: use processed text with [TABLE_N] markers + original HTML tables
      const parsed = parseDocHtml(html);
      // Use processed text if provided, else fall back to original
      const sourceText = text || parsed.textWithPlaceholders;
      bodyChildren = buildChildren(sourceText, parsed.tables, isApa);
    } else {
      // Plain text only
      bodyChildren = buildChildren(text, [], isApa);
    }

    const titlePageChildren: Paragraph[] = [];

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: FONT, size: BODY_SIZE } },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
              pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
            },
          },
          headers: isApa
            ? {
                default: new Header({
                  children: [new Paragraph({
                    children: [new TextRun({ children: [PageNumber.CURRENT], size: BODY_SIZE, font: FONT })],
                    alignment: AlignmentType.RIGHT,
                  })],
                }),
              }
            : undefined,
          children: [...titlePageChildren, ...bodyChildren],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${isApa ? "apa7-compliant" : "quillify-humanized"}.docx"`,
        "Content-Length": String(uint8.length),
      },
    });
  } catch (err) {
    console.error("DOCX error:", err);
    return NextResponse.json({ error: "Failed to generate Word file" }, { status: 500 });
  }
}
