import { NextRequest } from "next/server";
import { json, requireAdmin, safeRoute } from "@/lib/api-helpers";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

interface MusicConfig {
  enabled: boolean;
  url: string;
  volume: number;
  title: string;
}

const DEFAULT_CONFIG: MusicConfig = {
  enabled: false,
  url: "",
  volume: 0.15,
  title: "",
};

async function getMusicConfig(): Promise<MusicConfig> {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  try {
    const admin = await store.getAdminByEmail(bootstrapEmail);
    if (admin && admin.seller_label && admin.seller_label.startsWith("{")) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(admin.seller_label) };
    }
  } catch (e) {
    console.error("Error reading music config from DB:", e);
  }
  return DEFAULT_CONFIG;
}

async function saveMusicConfig(config: MusicConfig) {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
  const admin = await store.getAdminByEmail(bootstrapEmail);
  if (!admin) {
    throw new Error("Super admin user not found in database.");
  }
  await store.updateAdmin(admin.id, {
    ...admin,
    seller_label: JSON.stringify(config),
  });
}

// GET: anyone logged in can read the current music config
export async function GET() {
  return safeRoute(async () => {
    await requireAdmin();
    const config = await getMusicConfig();
    return { data: { success: true, config } };
  });
}

// POST: only super admin can update music config
export async function POST(req: NextRequest) {
  return safeRoute(async () => {
    const admin = await requireAdmin();
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    if (admin.email !== bootstrapEmail) {
      return { status: 403, data: { success: false, message: "Solo el administrador principal puede cambiar la música." } };
    }

    const body = await req.json().catch(() => ({}));

    const config: MusicConfig = {
      enabled: Boolean(body.enabled),
      url: String(body.url || "").trim(),
      volume: Math.max(0, Math.min(1, Number(body.volume) || 0.15)),
      title: String(body.title || "").trim(),
    };

    await saveMusicConfig(config);
    return { data: { success: true, message: "Configuración de música actualizada.", config } };
  });
}
