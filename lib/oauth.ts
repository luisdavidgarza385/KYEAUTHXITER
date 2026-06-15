export type OAuthProvider = "discord" | "google" | "apple" | "telegram";

export type OAuthProfile = {
  provider: OAuthProvider;
  provider_user_id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
};

export type OAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
};

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

function getRedirectUri(provider: string): string {
  return `${getBaseUrl()}/api/auth/${provider}/callback`;
}

export function getProviderConfig(provider: OAuthProvider): OAuthConfig | null {
  const base = getBaseUrl();
  const demo = process.env.OAUTH_DEMO_MODE === "1" || isDemoModeFor(provider);
  switch (provider) {
    case "discord": {
      const clientId = process.env.DISCORD_CLIENT_ID || "demo_discord_id";
      const clientSecret = process.env.DISCORD_CLIENT_SECRET || "demo_discord_secret";
      if (!process.env.DISCORD_CLIENT_ID && !demo) return null;
      return {
        clientId,
        clientSecret,
        redirectUri: `${base}/api/auth/discord/callback`,
        scope: "identify email",
        authorizeUrl: "https://discord.com/oauth2/authorize",
        tokenUrl: "https://discord.com/api/oauth2/token",
        userInfoUrl: "https://discord.com/api/users/@me",
      };
    }
    case "google": {
      const clientId = process.env.GOOGLE_CLIENT_ID || "demo_google_id";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "demo_google_secret";
      if (!process.env.GOOGLE_CLIENT_ID && !demo) return null;
      return {
        clientId,
        clientSecret,
        redirectUri: `${base}/api/auth/google/callback`,
        scope: "openid email profile",
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
      };
    }
    case "apple": {
      const clientId = process.env.APPLE_CLIENT_ID || "demo_apple_id";
      const clientSecret = process.env.APPLE_CLIENT_SECRET || "demo_apple_secret";
      if (!process.env.APPLE_CLIENT_ID && !demo) return null;
      return {
        clientId,
        clientSecret,
        redirectUri: `${base}/api/auth/apple/callback`,
        scope: "openid email name",
        authorizeUrl: "https://appleid.apple.com/auth/authorize",
        tokenUrl: "https://appleid.apple.com/auth/token",
        userInfoUrl: "",
      };
    }
    case "telegram": {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "demo_telegram_token";
      if (!process.env.TELEGRAM_BOT_TOKEN && !demo) return null;
      return {
        clientId: botToken,
        clientSecret: botToken,
        redirectUri: `${base}/api/auth/telegram/callback`,
        scope: "",
        authorizeUrl: "",
        tokenUrl: "",
        userInfoUrl: "",
      };
    }
  }
}

function isDemoModeFor(_provider: string): boolean {
  return process.env.OAUTH_DEMO_MODE === "1";
}

export function isProviderConfigured(provider: OAuthProvider): boolean {
  switch (provider) {
    case "discord":
      return !!process.env.DISCORD_CLIENT_ID || process.env.OAUTH_DEMO_MODE === "1";
    case "google":
      return !!process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_DEMO_MODE === "1";
    case "apple":
      return !!process.env.APPLE_CLIENT_ID || process.env.OAUTH_DEMO_MODE === "1";
    case "telegram":
      return !!process.env.TELEGRAM_BOT_TOKEN || process.env.OAUTH_DEMO_MODE === "1";
  }
}

export function buildAuthorizeUrl(provider: OAuthProvider, state: string): string | null {
  const cfg = getProviderConfig(provider);
  if (!cfg) return null;
  if (provider === "telegram") return null;
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: cfg.scope,
    state,
  });
  if (provider === "google") {
    params.set("access_type", "online");
    params.set("prompt", "select_account");
  }
  return `${cfg.authorizeUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(provider: OAuthProvider, code: string): Promise<string | null> {
  const cfg = getProviderConfig(provider);
  if (!cfg) return null;
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: cfg.redirectUri,
  });
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  if (provider === "discord") headers["Accept"] = "application/json";
  const r = await fetch(cfg.tokenUrl, { method: "POST", headers, body });
  if (!r.ok) return null;
  const j = await r.json();
  return j.access_token || null;
}

export async function fetchProfile(provider: OAuthProvider, accessToken: string): Promise<OAuthProfile | null> {
  const cfg = getProviderConfig(provider);
  if (!cfg) return null;
  if (provider === "discord") {
    const r = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return {
      provider: "discord",
      provider_user_id: u.id,
      email: u.email || null,
      name: u.global_name || u.username || null,
      avatar_url: u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith("a_") ? "gif" : "png"}`
        : null,
    };
  }
  if (provider === "google") {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return {
      provider: "google",
      provider_user_id: u.sub,
      email: u.email || null,
      name: u.name || null,
      avatar_url: u.picture || null,
    };
  }
  return null;
}

export function parseAppleIdToken(idToken: string): OAuthProfile | null {
  try {
    const [, payload] = idToken.split(".");
    if (!payload) return null;
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json = JSON.parse(Buffer.from(padded, "base64url").toString("utf-8"));
    return {
      provider: "apple",
      provider_user_id: json.sub,
      email: json.email || null,
      name: null,
      avatar_url: null,
    };
  } catch {
    return null;
  }
}

export function verifyTelegramAuth(data: Record<string, string>): OAuthProfile | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;
  const { hash, ...rest } = data;
  if (!hash) return null;
  const crypto = require("crypto") as typeof import("crypto");
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (hmac !== hash) return null;
  if (rest.auth_date) {
    const age = Math.floor(Date.now() / 1000) - parseInt(rest.auth_date);
    if (age > 86400) return null;
  }
  return {
    provider: "telegram",
    provider_user_id: rest.id,
    email: null,
    name: [rest.first_name, rest.last_name].filter(Boolean).join(" ") || rest.username || null,
    avatar_url: rest.photo_url || null,
  };
}

export function generateState(): string {
  return Buffer.from(require("crypto").randomBytes(16)).toString("hex");
}

export function verifyStateCookie(cookieValue: string | undefined, expected: string | undefined): boolean {
  if (!cookieValue || !expected) return false;
  return cookieValue === expected;
}
