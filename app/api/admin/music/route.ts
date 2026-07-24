import { NextRequest } from "next/server";
import { json, requireAdmin, safeRoute } from "@/lib/api-helpers";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MUSIC_CONFIG_PATH = path.join(process.cwd(), "data", "music-config.json");

interface MusicConfig {
  enabled: boolean;
  url: string; // URL to mp3 or audio file
  volume: number; // 0.0 to 1.0
  title: string; // Display name
}

const DEFAULT_CONFIG: MusicConfig = {
  enabled: false,
  url: "",
  volume: 0.15,
  title: "",
};

async function readConfig(): Promise<MusicConfig> {
  try {
    const raw = await fs.readFile(MUSIC_CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

async function writeConfig(config: MusicConfig) {
  const dir = path.dirname(MUSIC_CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(MUSIC_CONFIG_PATH, JSON.stringify(config, null, 2));
}

// GET: anyone logged in can read the current music config
export async function GET() {
  return safeRoute(async () => {
    await requireAdmin();
    const config = await readConfig();
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

    await writeConfig(config);
    return { data: { success: true, message: "Configuración de música actualizada.", config } };
  });
}
