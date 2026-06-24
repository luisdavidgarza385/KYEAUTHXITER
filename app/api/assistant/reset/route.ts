import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, { status });

  // 1. Verify assistant session cookie
  const sessionCookie = req.cookies.get("ka_assistant_session");
  if (!sessionCookie) {
    return json({ success: false, message: "No autorizado. Sesión no válida." }, 401);
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const input = String(payload?.input || "").trim();

    if (!input) {
      return json({ success: false, message: "Debes ingresar una licencia o usuario." }, 400);
    }

    const db = supabaseAdmin() as any;

    // 2. Try to search input as license key
    const { data: license } = (await db
      .from("licenses")
      .select("*")
      .eq("key", input)
      .maybeSingle()) as any;

    if (license) {
      if (!license.used_by) {
        return json({
          success: true,
          message: `La licencia **${input}** es válida pero no ha sido registrada por ningún usuario aún, por lo que no tiene un HWID bloqueado.`
        });
      }

      // Fetch user bound to this license
      const { data: appUser } = (await db
        .from("app_users")
        .select("*")
        .eq("id", license.used_by)
        .maybeSingle()) as any;

      if (!appUser) {
        return json({
          success: false,
          message: "La licencia está vinculada a un usuario inexistente."
        });
      }

      // Reset user HWID
      const { error: updateErr } = await db
        .from("app_users")
        .update({ hwid: null })
        .eq("id", appUser.id);

      if (updateErr) {
        return json({ success: false, message: "Error al actualizar el usuario en la base de datos." }, 500);
      }

      // Log the reset activity
      await db.from("logs").insert({
        app_id: license.app_id,
        user_id: appUser.id,
        message: `HWID reset via assistant for user ${appUser.username} using license key`,
        level: "info"
      });

      return json({
        success: true,
        message: `¡Encontrado! La licencia está vinculada al usuario **${appUser.username}**. Su HWID ha sido reseteado con éxito. Ya puede iniciar sesión.`
      });
    }

    // 3. Try to search input as username
    const { data: users } = (await db
      .from("app_users")
      .select("*")
      .eq("username", input)) as any;

    if (users && users.length > 0) {
      if (users.length > 1) {
        return json({
          success: false,
          duplicate: true,
          message: `He encontrado múltiples cuentas con el usuario **${input}**. Por seguridad, por favor ingresa directamente tu **licencia (key)** para realizar el reset.`
        });
      }

      const targetUser = users[0];

      // Reset user HWID
      const { error: updateErr } = await db
        .from("app_users")
        .update({ hwid: null })
        .eq("id", targetUser.id);

      if (updateErr) {
        return json({ success: false, message: "Error al actualizar el usuario en la base de datos." }, 500);
      }

      // Log the reset activity
      await db.from("logs").insert({
        app_id: targetUser.app_id,
        user_id: targetUser.id,
        message: `HWID reset via assistant for user ${targetUser.username} by username lookup`,
        level: "info"
      });

      return json({
        success: true,
        message: `¡Encontrado! El usuario **${targetUser.username}** ha sido localizado. Su HWID ha sido reseteado con éxito. Ya puede iniciar sesión.`
      });
    }

    // 4. Not found
    return json({
      success: false,
      notFound: true,
      message: `No he podido encontrar ninguna licencia o usuario con los datos **${input}**. Por favor, verifica la información e inténtalo de nuevo.`
    });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}
