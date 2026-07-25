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
    const rawInput = String(payload?.input || "").trim();

    if (!rawInput) {
      return json({ success: false, message: "Debes ingresar una licencia o usuario." }, 400);
    }

    const db = supabaseAdmin() as any;
    const cleanInput = rawInput.toLowerCase();

    // 2. Universal Search: Check if input matches a license key (exact or partial)
    let { data: licenses } = (await db
      .from("licenses")
      .select("*")
      .or(`key.eq.${rawInput},key.ilike.%${rawInput}%`)) as any;

    if (!licenses || licenses.length === 0) {
      // Try stripping app name prefix if user pasted e.g. "SPORTS GOAT Avanzado-77HM-KEMJ-L2KR-XY9K"
      const parts = rawInput.split("-");
      if (parts.length > 1) {
        const keyOnly = parts.slice(1).join("-").trim();
        if (keyOnly) {
          const { data: fallbackLic } = (await db
            .from("licenses")
            .select("*")
            .or(`key.eq.${keyOnly},key.ilike.%${keyOnly}%`)) as any;
          if (fallbackLic && fallbackLic.length > 0) {
            licenses = fallbackLic;
          }
        }
      }
    }

    if (licenses && licenses.length > 0) {
      const targetLic = licenses[0];

      // Fetch Application Name
      const { data: appObj } = await db
        .from("applications")
        .select("name")
        .eq("id", targetLic.app_id)
        .maybeSingle();
      const appName = appObj?.name || "Sistema";

      let resetUserMsg = "";

      // Reset associated user if used_by exists
      if (targetLic.used_by) {
        const { data: appUser } = await db
          .from("app_users")
          .select("*")
          .eq("id", targetLic.used_by)
          .maybeSingle();

        if (appUser) {
          await db
            .from("app_users")
            .update({ hwid: null })
            .eq("id", appUser.id);
          resetUserMsg = ` y al usuario vinculado **${appUser.username}**`;
        }
      }

      // Reset license record: clear used_by, reset status if paused/used, reset HWID
      await db
        .from("licenses")
        .update({
          status: "used",
          hwid_lock: false
        })
        .eq("id", targetLic.id);

      // Log activity
      await db.from("logs").insert({
        app_id: targetLic.app_id,
        user_id: targetLic.used_by || null,
        message: `Universal HWID reset via bot for license ${targetLic.key}`,
        level: "info"
      });

      return json({
        success: true,
        message: `✅ **RESET DE HWID Y LICENCIA EXITOSO**\n\nLa licencia **${targetLic.key}** de la aplicación **${appName}**${resetUserMsg} ha sido restablecida correctamente.\n\nSu HWID ha sido liberado en el sistema. Ya puedes registrarte o iniciar sesión en tu nuevo dispositivo.`
      });
    }

    // 3. Search input as Username or Email across ALL apps & sub-resellers
    const { data: appUsers } = (await db
      .from("app_users")
      .select("*")
      .or(`username.ilike.${rawInput},email.ilike.${rawInput}`)) as any;

    if (appUsers && appUsers.length > 0) {
      const targetUser = appUsers[0];

      // Reset user HWID
      await db
        .from("app_users")
        .update({ hwid: null })
        .eq("id", targetUser.id);

      // Unpause and unlock licenses used by this user
      await db
        .from("licenses")
        .update({ status: "used", hwid_lock: false })
        .eq("used_by", targetUser.id);

      // Fetch app name
      const { data: appObj } = await db
        .from("applications")
        .select("name")
        .eq("id", targetUser.app_id)
        .maybeSingle();
      const appName = appObj?.name || "Sistema";

      // Log activity
      await db.from("logs").insert({
        app_id: targetUser.app_id,
        user_id: targetUser.id,
        message: `Universal HWID reset via bot for user ${targetUser.username}`,
        level: "info"
      });

      return json({
        success: true,
        message: `✅ **RESET DE USUARIO (RESET WIN) EXITOSO**\n\nEl usuario **${targetUser.username}** de la aplicación **${appName}** ha sido localizado.\n\nSu Hardware ID (HWID) ha sido restablecido a cero. Ya puedes ingresar al loader desde tu nueva PC.`
      });
    }

    // 4. Not found in licenses or users
    return json({
      success: false,
      notFound: true,
      message: `No se encontró ninguna licencia o usuario coincidente con **${rawInput}** en la base de datos global.\n\nVerifica que la clave o usuario estén bien escritos e inténtalo de nuevo.`
    });

  } catch (e: any) {
    return json({ success: false, message: e?.message || "Error al procesar el reset." }, 500);
  }
}
