import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, { status });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ success: false, message: "Invalid JSON" }, 400);
    }

    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!username || !password) {
      return json({ success: false, message: "Usuario y contraseña requeridos" }, 400);
    }

    // Direct check for credentials: RESET 12 reset / 12
    if (username === "RESET 12 reset" && password === "12") {
      const cookieValue = Buffer.from(
        JSON.stringify({ username, role: "assistant", authenticated: true })
      ).toString("base64");

      const res = json({ success: true, message: "Sesión de asistente iniciada" });
      res.cookies.set("ka_assistant_session", cookieValue, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 2, // 2 hours is enough for support sessions
      });
      return res;
    }

    return json({ success: false, message: "Credenciales de asistente inválidas" }, 401);
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
