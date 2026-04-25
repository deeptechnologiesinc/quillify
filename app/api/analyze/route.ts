import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json({ error: "Text too short to analyze" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `You are an AI writing detector. Analyze text for patterns that indicate AI generation.
Return ONLY valid JSON in this exact format, no other text:
{"aiScore": <0-100>, "issues": ["issue1", "issue2", ...]}

Rules for scoring:
- 0-25: Very human, natural variation
- 26-50: Mostly human with some AI patterns
- 51-75: Likely AI-assisted
- 76-100: Strongly AI-generated

Check for these patterns:
- Uniform sentence length (all sentences similar in length = AI)
- Formal/uncommon vocabulary ("delve", "intricate", "multifaceted", "paramount", "leverage", "utilize", "furthermore", "moreover", "consequently")
- Passive voice overuse
- Generic transitions ("In conclusion", "It is important to note")
- Lack of personal voice or hedging
- Perfect grammar with zero personality
- Repetitive sentence structures
- No contractions in conversational contexts
- Frequent use of the em dash (—) to join clauses — this is a very strong AI signal`,
      messages: [
        {
          role: "user",
          content: `Analyze this text:\n\n${text.slice(0, 2000)}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Extract the JSON object regardless of what surrounds it (code blocks, commentary, etc.)
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      aiScore: Math.min(100, Math.max(0, Math.round(parsed.aiScore))),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 6) : [],
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
