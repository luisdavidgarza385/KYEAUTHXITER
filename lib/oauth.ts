import crypto from "crypto";

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

export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  return "http://localhost:3000";
}

export function getProviderConfig(provider: OAuthProvider): OAuthConfig | null {
  const base = getBaseUrl();

  switch (provider) {
    case "google": {
      const clientId = process.env.GOOGLE_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${base}/api/auth/google/callback`;
      return {
        clientId,
        clientSecret,
        redirectUri,
        scope: "openid email profile",
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      };
    }
    case "discord": {
      const clientId = process.env.DISCORD_CLIENT_ID || "";
      const clientSecret = process.env.DISCORD_CLIENT_SECRET || "";
      const redirectUri = process.env.DISCORD_REDIRECT_URI || `${base}/api/auth/discord/callback`;
      return {
        clientId,
        clientSecret,
        redirectUri,
        scope: "identify email",
        authorizeUrl: "https://discord.com/oauth2/authorize",
        tokenUrl: "https://discord.com/api/oauth2/token",
        userInfoUrl: "https://discord.com/api/users/@me",
      };
    }
    case "apple": {
      const clientId = process.env.APPLE_CLIENT_ID || "";
      const clientSecret = process.env.APPLE_CLIENT_SECRET || "";
      const redirectUri = process.env.APPLE_REDIRECT_URI || `${base}/api/auth/apple/callback`;
      return {
        clientId,
        clientSecret,
        redirectUri,
        scope: "openid email name",
        authorizeUrl: "https://appleid.apple.com/auth/authorize",
        tokenUrl: "https://appleid.apple.com/auth/token",
        userInfoUrl: "",
      };
    }
    case "telegram": {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
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

export function isProviderConfigured(provider: OAuthProvider): boolean {
  const cfg = getProviderConfig(provider);
  if (!cfg) return false;
  return Boolean(cfg.clientId && cfg.clientId.trim().length > 0);
}

export function buildAuthorizeUrl(provider: OAuthProvider, state: string): string | null {
  const cfg = getProviderConfig(provider);
  if (!cfg || !cfg.clientId) return null;

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: cfg.scope,
    state,
  });

  if (provider === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "select_account");
    params.set("include_granted_scopes", "true");
  } else if (provider === "discord") {
    params.set("prompt", "consent");
  }

  return `${cfg.authorizeUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(provider: OAuthProvider, code: string): Promise<string | null> {
  const cfg = getProviderConfig(provider);
  if (!cfg || !cfg.clientId || !cfg.clientSecret) {
    console.error(`[OAuth] Missing credentials for ${provider}`);
    return null;
  }

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: cfg.redirectUri,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (provider === "discord") {
    headers["Accept"] = "application/json";
  }

  try {
    const res = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[OAuth Token Exchange Error] ${provider} HTTP ${res.status}:`, errText);
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error(`[OAuth Token Exchange Exception] ${provider}:`, err);
    return null;
  }
}

export async function fetchProfile(provider: OAuthProvider, accessToken: string): Promise<OAuthProfile | null> {
  const cfg = getProviderConfig(provider);
  if (!cfg) return null;

  try {
    if (provider === "discord") {
      const res = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        console.error("[OAuth Discord UserInfo Error]", await res.text());
        return null;
      }
      const u = await res.json();
      return {
        provider: "discord",
        provider_user_id: String(u.id),
        email: u.email ? String(u.email).toLowerCase() : null,
        name: u.global_name || u.username || null,
        avatar_url: u.avatar
          ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith("a_") ? "gif" : "png"}`
          : null,
      };
    }

    if (provider === "google") {
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        console.error("[OAuth Google UserInfo Error]", await res.text());
        return null;
      }
      const u = await res.json();
      return {
        provider: "google",
        provider_user_id: String(u.id || u.sub),
        email: u.email ? String(u.email).toLowerCase() : null,
        name: u.name || null,
        avatar_url: u.picture || null,
      };
    }
  } catch (err) {
    console.error(`[OAuth UserInfo Exception] ${provider}:`, err);
    return null;
  }

  return null;
}

export function generateState(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function verifyStateCookie(cookieValue: string | undefined, expected: string | undefined): boolean {
  if (!cookieValue || !expected) return false;
  return cookieValue === expected;
}
