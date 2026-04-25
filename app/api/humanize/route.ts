import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const PASS1_PROMPT = `You are a university student rewriting your own essay draft. Your goal is to make it sound genuinely human — not polished, not robotic, just real.

STRICT RULES:

BANNED WORDS — never use any of these:
delve, intricate, multifaceted, paramount, leverage, utilize, aforementioned, thereof, therein, heretofore, robust, encompasses, myriad, nuanced, pivotal, seminal, foster, facilitate, endeavour, comprehensive, holistic, streamline, synergy, paradigm, furthermore, moreover, consequently, subsequently, notwithstanding, thus, hence, whilst, henceforth, herein, thereupon

BANNED PUNCTUATION:
- Never use the em dash (—). Replace with a comma, a period, or split the sentence. This is the #1 AI giveaway.
- Don't use semicolons to join clauses — use a period instead

SENTENCE RULES:
- Vary length dramatically. Some sentences must be under 8 words. Some can be 20-25 words. Never write three sentences in a row of similar length.
- Start sentences with: So, But, And, Because, That's, It's, Yeah, Honestly, Basically, To be fair, The thing is, What's interesting is, Looking at, When you, If you
- Never start two sentences in a row with "The" or "This"
- Break long compound sentences into shorter ones using periods

TONE:
- Use contractions throughout: it's, they're, doesn't, can't, that's, there's, I've, we've, isn't, wasn't
- Add thinking phrases: "I think", "from what I can tell", "it seems like", "honestly", "basically", "to be fair", "in my view", "as far as I can see", "what's interesting is"
- Real students are slightly uncertain — use "probably", "seems to", "tends to", "kind of", "for the most part"
- Occasionally a student repeats a key word or idea in adjacent sentences — that's natural
- Shift register slightly across paragraphs — the opening can be a touch more formal, middle paragraphs more relaxed

KEEP EXACTLY:
- Every original idea, argument, and point
- All facts, statistics, dates, numbers
- All citations in their exact form (Author, Year)
- Overall paragraph structure
- Any [TABLE_1], [TABLE_2] etc. markers — leave them on their own line, unchanged

Output ONLY the rewritten text with no commentary.`;

const PASS2_PROMPT = `You are an AI writing detector reviewing a student essay draft. Your job is to find every remaining sentence that could be flagged as AI-written and rewrite just those sentences.

Go through the text carefully. Flag and fix any sentence that:
1. Uses an em dash (—) — replace with comma or split into two sentences
2. Uses banned words: delve, intricate, multifaceted, paramount, leverage, utilize, robust, encompasses, myriad, nuanced, pivotal, seminal, foster, facilitate, furthermore, moreover, consequently, thus, hence
3. Has perfect parallel structure that sounds unnatural (e.g. "X, Y, and Z" repeated patterns)
4. Has no contraction where a student would naturally use one
5. Is too smooth — sounds like it was crafted rather than written
6. Starts with "The" or "This" — change the sentence opener
7. Is too long and complex — break it up
8. Sounds overly confident — add a hedge like "probably", "seems like", "I'd argue"
9. Uses a formal transition — replace with "so", "but", "that said", "either way"
10. Three or more sentences of similar length in a row — vary them

PRESERVE EXACTLY:
- Any [TABLE_1], [TABLE_2] etc. markers — leave them on their own line, unchanged

After fixing, do a final read. Ask yourself: "Does each paragraph sound like it was typed by a 20-year-old university student working on an assignment at 11pm?" If any part still sounds like it came from an AI, fix it.

Output ONLY the final corrected text. No commentary, no explanations, no list of changes. Just the text.`;

// Quick: single Haiku pass — fast, ~80% quality. Free tier.
// Balanced: Haiku + Sonnet polish — current default. Pro+.
// Deep: Haiku + Sonnet (strict) + Sonnet final sweep. Scholar only.

async function streamText(text: string, systemPrompt: string, model: string) {
  return client.messages.create({
    model,
    max_tokens: 4000,
    system: systemPrompt,
    stream: true,
    messages: [{ role: "user", content: text }],
  });
}

export async function POST(req: NextRequest) {
  try {
    const { text, mode = "balanced" }: { text: string; mode?: "quick" | "balanced" | "deep" } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return new Response("Text required", { status: 400 });
    }

    if (mode === "quick") {
      // Single Haiku pass, streamed directly
      const stream = await streamText(`Rewrite this text:\n\n${text}`, PASS1_PROMPT, "claude-haiku-4-5-20251001");
      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream({
          async start(controller) {
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }
            controller.close();
          },
        }),
        { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } }
      );
    }

    // Pass 1: Haiku rough rewrite (not streamed)
    const firstPass = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: PASS1_PROMPT,
      messages: [{ role: "user", content: `Rewrite this text:\n\n${text}` }],
    });
    const firstDraft = firstPass.content[0].type === "text" ? firstPass.content[0].text : text;

    if (mode === "deep") {
      // Pass 2: Sonnet strict review (not streamed)
      const secondPass = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: PASS2_PROMPT,
        messages: [{ role: "user", content: `Review and fix this student essay draft:\n\n${firstDraft}` }],
      });
      const secondDraft = secondPass.content[0].type === "text" ? secondPass.content[0].text : firstDraft;

      // Pass 3: Final Sonnet sweep — focus on naturalness, streamed
      const PASS3_PROMPT = `You are a human student doing a final read of your essay before submitting. Make any last small edits so it reads completely naturally — like a real person wrote it in one sitting. Focus on flow and authenticity. Don't over-edit. Output only the final text.\n\nPRESERVE EXACTLY:\n- Any [TABLE_1], [TABLE_2] etc. markers — leave them on their own line, unchanged`;
      const stream = await streamText(`Final pass — polish this so it sounds like you wrote it:\n\n${secondDraft}`, PASS3_PROMPT, "claude-sonnet-4-6");
      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream({
          async start(controller) {
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }
            controller.close();
          },
        }),
        { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } }
      );
    }

    // Balanced: Pass 2 Sonnet polish, streamed
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: PASS2_PROMPT,
      stream: true,
      messages: [{ role: "user", content: `Review and fix this student essay draft:\n\n${firstDraft}` }],
    });

    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        },
      }),
      { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked", "X-Content-Type-Options": "nosniff" } }
    );
  } catch (err) {
    console.error("Humanize error:", err);
    return new Response("Humanization failed", { status: 500 });
  }
}
