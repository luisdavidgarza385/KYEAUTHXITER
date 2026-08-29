import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || null;
  return NextResponse.json({ botUsername });
}
