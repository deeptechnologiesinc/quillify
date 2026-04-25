import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { saveDocument } from "@/lib/usage";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { original, humanized, title } = await req.json();
  if (!original || typeof original !== "string") {
    return NextResponse.json({ error: "original text required" }, { status: 400 });
  }

  await saveDocument(userId, original, humanized ?? null, title);
  return NextResponse.json({ ok: true });
}
