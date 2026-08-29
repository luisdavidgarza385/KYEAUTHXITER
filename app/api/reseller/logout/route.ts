import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada",
  });

  // Eliminar cookie de sesión
  response.cookies.delete("admin_session");

  return response;
}
