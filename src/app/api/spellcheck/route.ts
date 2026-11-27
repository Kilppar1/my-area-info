import { NextResponse } from "next/server";
import { suggestSpelling } from "@/lib/spellchecker";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const word = body.word;

    if (typeof word !== "string" || word.length > 100) {
      return NextResponse.json({ suggestion: null }, { status: 400 });
    }

    const suggestion = suggestSpelling(word);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Spellcheck failed:", error);

    return NextResponse.json({ suggestion: null }, { status: 500 });
  }
}
