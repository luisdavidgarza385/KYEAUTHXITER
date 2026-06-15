import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 });
    }
    const admin = await store.getAdminByEmail(email.toLowerCase().trim());
    if (!admin) {
      return NextResponse.json({ success: false, message: "No account found with that email" }, { status: 404 });
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await store.updateAdmin(admin.id, { ...admin, password_hash });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "Server error" }, { status: 500 });
  }
}
