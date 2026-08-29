import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;
    const token = body.token || crypto.randomBytes(24).toString("hex");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
    const username = email.split("@")[0];

    await sendVerificationEmail({
      username,
      email,
      verifyUrl,
    });

    return NextResponse.json({ success: true, message: "Verification email resent" });
  } catch (e: any) {
    console.error("Failed to resend verification email:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
