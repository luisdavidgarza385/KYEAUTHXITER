import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, getScopedAppIds } from "@/lib/auth";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentAdmin();
    if (!me) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    if (!q) {
      return NextResponse.json({ success: true, results: [] });
    }

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    const isSuperAdmin = me.email.toLowerCase() === bootstrapEmail.toLowerCase();
    const scopedIds = await getScopedAppIds(me);

    const [allApps, allLicenses, allUsers, allAdmins] = await Promise.all([
      store.listApps(),
      store.listLicenses({ limit: 1000 }),
      store.listAppUsers({ limit: 1000 }),
      store.listAdmins(),
    ]);

    let accessibleApps = isSuperAdmin
      ? allApps
      : allApps.filter((a) => a.seller_id === me.id || (scopedIds && scopedIds.includes(a.id)));
    const accessibleAppIds = new Set(accessibleApps.map((a) => a.id));

    const results: any[] = [];

    // 1. Navigation items
    const navItems = [
      { type: "page", title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard", subtitle: "Resumen principal" },
      { type: "page", title: "Aplicaciones", url: "/dashboard/apps", icon: "AppWindow", subtitle: "Gestionar tus aplicaciones" },
      { type: "page", title: "Licencias", url: "/dashboard/licenses", icon: "Key", subtitle: "Generar y gestionar licencias" },
      { type: "page", title: "Usuarios", url: "/dashboard/users", icon: "Users", subtitle: "Usuarios registrados en tus apps" },
      { type: "page", title: "Sub-resellers", url: "/dashboard/sub-resellers", icon: "UserCheck", subtitle: "Gestionar vendedores afiliados" },
      { type: "page", title: "Créditos", url: "/dashboard/credits", icon: "Coins", subtitle: "Saldo y recargas" },
      { type: "page", title: "Chat Global", url: "/dashboard/chat", icon: "MessageSquare", subtitle: "Mensajes y comunicados" },
      { type: "page", title: "Seguridad (2FA)", url: "/dashboard/security", icon: "Shield", subtitle: "Autenticación de dos factores" },
      { type: "page", title: "API / Documentación", url: "/dashboard/api", icon: "Code", subtitle: "Llaves API y endpoints" },
      { type: "page", title: "Configuración / Música", url: "/dashboard/settings", icon: "Settings", subtitle: "Configuración del panel" },
    ];

    for (const item of navItems) {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) {
        results.push({ ...item, category: "Navegación" });
      }
    }

    // 2. Apps
    for (const app of accessibleApps) {
      if (app.name.toLowerCase().includes(q) || app.app_id.toLowerCase().includes(q)) {
        results.push({
          type: "app",
          title: app.name,
          subtitle: `App ID: ${app.app_id} • Status: ${app.status}`,
          url: `/dashboard/apps?selected=${app.id}`,
          category: "Aplicaciones",
        });
      }
    }

    // 3. Sub-resellers (for admins who created them or superadmin)
    const mySubResellers = allAdmins.filter((a) => a.created_by === me.id || isSuperAdmin);
    for (const sub of mySubResellers) {
      if (sub.email.toLowerCase().includes(q) || (sub.seller_label && sub.seller_label.toLowerCase().includes(q)) || sub.id.toLowerCase().includes(q)) {
        results.push({
          type: "sub-reseller",
          title: sub.seller_label || sub.email.split("@")[0],
          subtitle: `API Key: ${sub.id.slice(0, 15)}... • Rol: ${sub.role}`,
          url: "/dashboard/sub-resellers",
          category: "Sub-resellers",
        });
      }
    }

    // 4. Licenses
    const matchedLicenses = allLicenses.filter((l) =>
      (isSuperAdmin || (l.app_id && accessibleAppIds.has(l.app_id))) &&
      (l.key.toLowerCase().includes(q) || (l.used_by && l.used_by.toLowerCase().includes(q)))
    ).slice(0, 5);

    for (const lic of matchedLicenses) {
      results.push({
        type: "license",
        title: lic.key,
        subtitle: `Estado: ${lic.status} • Creado: ${new Date(lic.created_at).toLocaleDateString()}`,
        url: "/dashboard/licenses",
        category: "Licencias",
      });
    }

    // 5. App Users
    const matchedUsers = allUsers.filter((u) =>
      (isSuperAdmin || (u.app_id && accessibleAppIds.has(u.app_id))) &&
      (u.username.toLowerCase().includes(q) || (u.hwid && u.hwid.toLowerCase().includes(q)))
    ).slice(0, 5);

    for (const u of matchedUsers) {
      results.push({
        type: "user",
        title: u.username,
        subtitle: `HWID: ${u.hwid ? u.hwid.slice(0, 12) + "..." : "Ninguno"} • Banned: ${u.banned ? "Sí" : "No"}`,
        url: "/dashboard/users",
        category: "Usuarios",
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
