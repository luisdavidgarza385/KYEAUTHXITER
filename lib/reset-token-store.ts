// Shared in-memory token store for password reset
// Uses globalThis to persist across hot reloads in development
const key = "__securex_reset_tokens__";

if (!(globalThis as any)[key]) {
  (globalThis as any)[key] = new Map<string, { adminId: string; expiresAt: number }>();
}

export const resetTokenStore: Map<string, { adminId: string; expiresAt: number }> = (globalThis as any)[key];
