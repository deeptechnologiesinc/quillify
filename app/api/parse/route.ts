import { NextRequest, NextResponse } from "next/server";
import { parseDocHtml } from "@/lib/htmlUtils";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    let html: string | null = null;

    if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8")
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    } else if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
      const mammoth = await import("mammoth");

      // Convert to HTML — preserves tables, headings, bold, italic
      const htmlResult = await mammoth.convertToHtml({ buffer });
      html = htmlResult.value;

      // Extract text with [TABLE_N] placeholders so AI can process prose
      const parsed = parseDocHtml(html);
      text = parsed.textWithPlaceholders;

    } else if (fileName.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfModule = await import("pdf-parse") as any;
      const pdfParse = pdfModule.default ?? pdfModule;
      const data = await pdfParse(buffer);
      text = data.text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use .txt, .docx, or .pdf" },
        { status: 400 }
      );
    }

    if (text.length < 10) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    return NextResponse.json({ text, html });
  } catch (err) {
    console.error("Parse error:", err);
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }
}
