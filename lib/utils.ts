import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(length = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateKey(prefix = "Guate Xiter", segments = 4, segmentLen = 4): string {
  const segs: string[] = [];
  for (let i = 0; i < segments; i++) {
    segs.push(generateId(segmentLen).toUpperCase());
  }
  return prefix ? `${prefix}-${segs.join("-")}` : segs.join("-");
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function maskKey(key: string): string {
  const parts = key.split("-");
  if (parts.length < 2) return key.slice(0, 4) + "****";
  return parts[0] + "-****-****-" + parts[parts.length - 1];
}
