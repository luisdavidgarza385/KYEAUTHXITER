import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { getClientIp, generateId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const secureJson = (data: unknown, status = 200) => {
  const res = NextResponse.json(data, { status });
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';");
  return res;
};

const json = secureJson;

// Brute-force & Anti-spam Rate Limiting state
const rateLimits = new Map<string, { attempts: number; blockedUntil: number }>();

function registerFailure(ip: string) {
  const limit = rateLimits.get(ip) || { attempts: 0, blockedUntil: 0 };
  limit.attempts += 1;
  if (limit.attempts >= 10) {
    limit.blockedUntil = Date.now() + 5 * 60 * 1000; // Block for 5 minutes
  }
  rateLimits.set(ip, limit);
}

function registerSuccess(ip: string) {
  rateLimits.delete(ip);
}

function xorDecrypt(hexData: string, key: string): string {
  const buf = Buffer.from(hexData, "hex");
  const keyBuf = Buffer.from(key, "utf-8");
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
  }
  return out.toString("utf-8");
}
function hex2bin(hex: string): string {
  try { return Buffer.from(hex, "hex").toString("utf-8"); } catch { return hex; }
}

function bin2hex(str: string): string {
  return Buffer.from(str, "utf-8").toString("hex");
}

async function getParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") || "";
  const text = await req.text();
  const params: Record<string, string> = {};

  // Debug: log raw body for non-JSON requests
  if (!ct.includes("application/json") && text.length < 2000) {
    console.log("[RAW BODY]", text);
  }

  if (ct.includes("application/json")) {
    try { return JSON.parse(text); } catch {}
  }
  try {
    const sp = new URLSearchParams(text);
    for (const [k, v] of sp) params[k] = v;
  } catch {}
  // NOTE: hex-decode deshabilitado — el SDK C++ no usa este protocolo
  // if (hexEncoded && Object.keys(params).length > 0) { ... }

  for (const [k, v] of new URL(req.url).searchParams) {
    if (!params[k]) params[k] = v;
  }
  return params;
}

const sessionsMap = new Map();

function toUnixTimestamp(dateVal: any): string {
  if (!dateVal) return "0";
  if (dateVal === "lifetime" || String(dateVal).toLowerCase() === "lifetime") return "lifetime";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      if (/^\d+$/.test(String(dateVal))) return String(dateVal);
      return "0";
    }
    return String(Math.floor(d.getTime() / 1000));
  } catch {
    return "0";
  }
}

export async function POST(req: NextRequest) {
  try {
    const p = await getParams(req);
    const type = p.type;
    const ip = getClientIp(req);

    // 1. Rate Limiting Check
    const ipLimit = rateLimits.get(ip);
    if (ipLimit && ipLimit.blockedUntil > Date.now()) {
      return json({ success: false, message: "Demasiadas peticiones. Bloqueado temporalmente." }, 429);
    }

    // 2. Input Sanitization (Anti SQL/HTML injection)
    const suspiciousSql = /['";#]/g;
    const valuesToCheck = [p.username, p.key, p.appid, p.secret, p.type].filter(Boolean);
    for (const val of valuesToCheck) {
      if (typeof val === "string" && (suspiciousSql.test(val) || val.toUpperCase().includes(" OR ") || val.toUpperCase().includes(" UNION "))) {
        registerFailure(ip);
        return json({ success: false, message: "Petición bloqueada por razones de seguridad." }, 400);
      }
    }

    // 3. Session Hijacking Prevention
    if (type !== "init" && p.sessionid) {
      const session = sessionsMap.get(String(p.sessionid));
      if (session) {
        if (session.ip !== ip) {
          registerFailure(ip);
          return json({ success: false, message: "Acceso denegado: IP de sesión incorrecta." }, 401);
        }
        const hwid = p.hwid || null;
        if (session.hwid && hwid && session.hwid !== hwid) {
          registerFailure(ip);
          return json({ success: false, message: "Acceso denegado: Dispositivo no autorizado." }, 401);
        }
      }
    }

    if (type === "init") {
      const name = p.name;
      const ownerid = p.ownerid;
      const appId = p.appid || ownerid;

      let app: any = null;
      if (name) app = await store.getAppByName(String(name));
      if (!app && appId) app = await store.getAppByAppId(String(appId));
      if (!app) return json({ success: false, message: "Application not found" }, 404);

      if (p.secret && p.secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);
      if (app.status !== "active") return json({ success: false, message: "Application is " + app.status }, 403);

      const hwid = p.hwid || null;
      const sessionId = generateId(48);
      const enckey = generateId(64);
      const nonce = generateId(16);
      const expires = new Date(Date.now() + 86400000);
      sessionsMap.set(sessionId, { app_id: app.id, user_id: null, ip, hwid: p.hwid || null, enckey, expires_at: expires.toISOString(), valid: true });
      await store.createLog({ app_id: app.id, user_id: null, message: `init from ${ip}`, level: "info" });

      const allLicenses = await store.listLicenses({ appId: app.id });
      const allUsers = await store.listAppUsers({ appId: app.id });
      const numKeys = allLicenses.length;
      const numUsers = allUsers.length;
      const numOnline = allUsers.filter((u: any) => u.last_login && Date.now() - new Date(u.last_login).getTime() < 300000).length;

      const appInfoData = {
        name: app.name,
        version: app.version,
        download_link: app.download_link || "",
        numUsers: String(numUsers),
        numOnlineUsers: String(numOnline),
        numKeys: String(numKeys),
        customerPanelLink: "",
      };
      const userData = {
        username: "",
        ip: "",
        hwid: "",
        createdate: "",
        lastlogin: "",
        subscription: "",
        subscriptions: [],
        expiry: "",
      };
      return json({
        success: true,
        sessionid: sessionId,
        message: "",
        ownerid: app.app_id,
        appinfo: appInfoData,
        subscriptions: [],
        userdata: userData,
        user_data: userData,
        nonce,
        enckey,
      });
    }

    if (type === "login") {
      const appId = p.appid || p.ownerid;
      const sessionId = p.sessionid;
      const username = p.username;
      const password = p.pass || p.password;
      const hwid = p.hwid || null;

      if (!appId || !username || !password) return json({ success: false, message: "appid, username, password required" }, 400);
      if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);

      const app = await store.getAppByAppId(String(appId));
      if (!app) return json({ success: false, message: "Application not found" }, 404);
      if (p.secret && p.secret !== app.app_secret) return json({ success: false, message: "Invalid application secret" }, 401);

      const session = sessionsMap.get(String(sessionId));
      if (!session || session.app_id !== app.id) return json({ success: false, message: "Invalid session" }, 401);

      const user = await store.getAppUser(app.id, String(username));
      if (!user) {
        registerFailure(ip);
        return json({ success: false, message: "Invalid credentials" }, 401);
      }
      if (user.banned) return json({ success: false, message: "You are banned: " + (user.ban_reason || "") }, 403);

      let valid = await bcrypt.compare(String(password), user.password_hash);
      if (!valid) valid = String(password) === String(user.password_hash);
      if (!valid) {
        registerFailure(ip);
        return json({ success: false, message: "Invalid credentials" }, 401);
      }

      // Cualquier usuario autenticado correctamente tiene acceso
      const userLicenses = await store.listLicenses({ appId: app.id });
      const myLicenses = userLicenses.filter(l => l.used_by === user.id);
      const activeLicenses = myLicenses.filter(l => l.status === "used" && (!l.expires_at || new Date(l.expires_at) > new Date()));

      await store.updateAppUser(user.id, { last_login: new Date().toISOString(), ip, hwid: hwid || user.hwid });
      await store.updateSession(String(sessionId), { user_id: user.id, hwid, ip });
      await store.createLog({ app_id: app.id, user_id: user.id, message: `login ${username}`, level: "info" });

      registerSuccess(ip);

      let maxExpiry = 0;
      const subs: any[] = [];
      activeLicenses.forEach(l => {
        const lvl = l.level || 1;
        let subName = "basic";
        if (lvl === 2) subName = "VIP";
        if (lvl === 3) subName = "Combo";
        // Override with package_name if they provided a custom one that isn't Bypass
        if (l.package_name && l.package_name.trim() !== "" && l.package_name !== "Bypass") {
          if (l.package_name.toLowerCase() === "basic") {
            subName = "basic";
          } else if (l.package_name.toLowerCase() === "vip") {
            subName = "VIP";
          } else {
            subName = l.package_name;
          }
        }
        
        if (l.expires_at) {
          const t = new Date(l.expires_at).getTime();
          if (t > maxExpiry) maxExpiry = t;
        } else {
          maxExpiry = Infinity;
        }

        const expiryVal = toUnixTimestamp(l.expires_at || "lifetime");
        const isVahalla = req.headers.get("x-vahalla-client") === "1.0" || 
                          req.headers.get("user-agent")?.includes("Vahalla") || 
                          String(p.name).toUpperCase().includes("WHITE") || 
                          String(p.name).toUpperCase().includes("BLK") ||
                          String(p.name).toUpperCase().includes("XITER");

        const isVipLic = lvl >= 2 || (l.package_name && l.package_name.toLowerCase() === "vip");
        if (isVahalla) {
          subs.push({ subscription: "basic", name: "basic", key: l.key, expiry: expiryVal });
          subs.push({ subscription: "VIP", name: "VIP", key: l.key, expiry: expiryVal });
          subs.push({ subscription: "Combo", name: "Combo", key: l.key, expiry: expiryVal });
        } else {
          if (isVipLic) {
            subs.push({ subscription: "VIP", name: "VIP", key: l.key, expiry: expiryVal });
            subs.push({ subscription: "basic", name: "basic", key: l.key, expiry: expiryVal });
            subs.push({ subscription: "Combo", name: "Combo", key: l.key, expiry: expiryVal });
          } else {
            subs.push({ subscription: "basic", name: "basic", key: l.key, expiry: expiryVal });
            subs.push({ subscription: "VIP", name: "VIP", key: l.key, expiry: expiryVal });
            subs.push({ subscription: "Combo", name: "Combo", key: l.key, expiry: expiryVal });
          }
        }
        if (subName !== "basic" && subName !== "VIP" && subName !== "Combo") {
          subs.push({ subscription: subName, name: subName, key: l.key, expiry: expiryVal });
        }
      });

      const expiryStr = maxExpiry === Infinity ? "lifetime" : maxExpiry > 0 ? String(Math.floor(maxExpiry / 1000)) : "0";

      const responseUserData = {
        username: user.username,
        ip,
        hwid: hwid || user.hwid || "",
        createdate: toUnixTimestamp(user.created_at),
        lastlogin: toUnixTimestamp(user.last_login),
        expiry: expiryStr,
        subscriptions: subs,
        role: "user",
        balance: String(user.balance || 0),
      };

      return json({
        success: true,
        message: "Logged in",
        info: responseUserData,
        userdata: responseUserData,
        user_data: responseUserData,
      });
    }

    if (type === "register") {
      const appId = p.ownerid || p.appid;
      const sessionId = p.sessionid;
      const username = p.username;
      const password = p.pass || p.password;
      const key = p.key;
      const hwid = p.hwid || null;

      if (!appId || !username || !password) return json({ success: false, message: "appid, username, password required" }, 400);
      if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);
      if (!key) return json({ success: false, message: "License key required" }, 400);

      const app = await store.getAppByAppId(String(appId));
      if (!app) return json({ success: false, message: "Application not found" }, 404);
      if (app.status !== "active") return json({ success: false, message: "Application is " + app.status }, 403);

      const session = sessionsMap.get(String(sessionId));
      if (!session || session.app_id !== app.id) return json({ success: false, message: "Invalid session" }, 401);

      const existing = await store.getAppUser(app.id, String(username));
      if (existing) return json({ success: false, message: "Username already exists" }, 409);

      const lic = await store.getLicenseByKey(app.id, String(key));
      if (!lic) return json({ success: false, message: "Invalid license key" }, 404);
      if (lic.status === "banned") return json({ success: false, message: "License is banned" }, 403);
      if (lic.uses >= lic.max_uses) return json({ success: false, message: "License has no uses left" }, 403);

      if (lic.hwid_lock && hwid && lic.used_by) {
        const prev = await store.getAppUserById(lic.used_by);
        if (prev?.hwid && prev.hwid !== hwid) {
          return json({ success: false, message: "License locked to a different HWID" }, 403);
        }
      }

      const passwordHash = await bcrypt.hash(String(password), 10);
      const user = await store.createAppUser({
        app_id: app.id,
        username: String(username),
        email: null,
        password_hash: passwordHash,
        hwid,
        ip,
        last_login: new Date().toISOString(),
        banned: false,
        ban_reason: null,
      });

      const now = new Date();
      const expires = new Date(now.getTime() + lic.duration_days * 86400000);
      await store.updateLicense(lic.id, {
        status: "used",
        used_by: user.id,
        activated_at: now.toISOString(),
        expires_at: expires.toISOString(),
        uses: lic.uses + 1,
      });
      sessionsMap.set(String(sessionId), { ...session, user_id: user.id, hwid, ip });
      await store.createLog({ app_id: app.id, user_id: user.id, message: `registered ${username}`, level: "info" });

      let subName = "basic";
      if (lic.level === 2) subName = "VIP";
      if (lic.level === 3) subName = "Combo";
      if (lic.package_name && lic.package_name.trim() !== "" && lic.package_name !== "Bypass") {
        if (lic.package_name.toLowerCase() === "basic") {
          subName = "basic";
        } else if (lic.package_name.toLowerCase() === "vip") {
          subName = "VIP";
        } else {
          subName = lic.package_name;
        }
      }

      const expiryStr = toUnixTimestamp(expires);
      const responseUserData = {
        username: user.username,
        ip: user.ip || ip,
        hwid: user.hwid || hwid || "",
        createdate: toUnixTimestamp(user.created_at),
        lastlogin: toUnixTimestamp(user.last_login),
        expiry: expiryStr,
        subscriptions: (
          req.headers.get("x-vahalla-client") === "1.0" || 
          req.headers.get("user-agent")?.includes("Vahalla") || 
          String(p.name).toUpperCase().includes("WHITE") || 
          String(p.name).toUpperCase().includes("BLK") ||
          String(p.name).toUpperCase().includes("XITER")
        ) ? [
          { subscription: "basic", name: "basic", key: key, expiry: expiryStr },
          { subscription: "VIP", name: "VIP", key: key, expiry: expiryStr },
          { subscription: "Combo", name: "Combo", key: key, expiry: expiryStr }
        ] : (
          (lic.level >= 2 || (lic.package_name && lic.package_name.toLowerCase() === "vip")) ? [
            { subscription: "VIP", name: "VIP", key: key, expiry: expiryStr },
            { subscription: "basic", name: "basic", key: key, expiry: expiryStr },
            { subscription: "Combo", name: "Combo", key: key, expiry: expiryStr }
          ] : [
            { subscription: "basic", name: "basic", key: key, expiry: expiryStr },
            { subscription: "VIP", name: "VIP", key: key, expiry: expiryStr },
            { subscription: "Combo", name: "Combo", key: key, expiry: expiryStr }
          ]
        ),
      };

      return json({
        success: true,
        message: "Registered",
        info: responseUserData,
        userdata: responseUserData,
        user_data: responseUserData,
      });
    }

    if (type === "license") {
      const appId = p.ownerid || p.appid;
      const sessionId = p.sessionid;
      const key = p.key;
      const hwid = p.hwid || null;

      if (!appId || !key) return json({ success: false, message: "appid and key required" }, 400);
      if (!sessionId) return json({ success: false, message: "sessionid required" }, 400);

      const app = await store.getAppByAppId(String(appId));
      if (!app) return json({ success: false, message: "Application not found" }, 404);
      if (app.status !== "active") return json({ success: false, message: "Application is " + app.status }, 403);

      const session = sessionsMap.get(String(sessionId));
      if (!session || session.app_id !== app.id) return json({ success: false, message: "Invalid session" }, 401);

      const lic = await store.getLicenseByKey(app.id, String(key));
      if (!lic) return json({ success: false, message: "Invalid license" }, 404);
      if (lic.status === "banned") return json({ success: false, message: "License banned" }, 403);
      if (lic.status === "unused" && lic.uses >= lic.max_uses) return json({ success: false, message: "No uses left" }, 403);

      if (lic.hwid_lock && hwid && lic.used_by) {
        const prev = await store.getAppUserById(lic.used_by);
        if (prev?.hwid && prev.hwid !== hwid) {
          return json({ success: false, message: "HWID mismatch" }, 403);
        }
      }

      const now = new Date();
      let expiresAt = lic.expires_at ? new Date(lic.expires_at) : null;
      if (!expiresAt || expiresAt < now) {
        expiresAt = new Date(now.getTime() + lic.duration_days * 86400000);
        await store.updateLicense(lic.id, {
          status: "used",
          used_by: lic.used_by || session.user_id,
          activated_at: lic.activated_at || now.toISOString(),
          expires_at: expiresAt.toISOString(),
          uses: lic.uses + 1,
        });
      } else if (session.user_id) {
        await store.updateLicense(lic.id, { uses: lic.uses + 1 });
      }

      await store.createLog({ app_id: app.id, user_id: session.user_id, message: `license valid ${key}`, level: "info" });

      let licUser = null;
      if (lic.used_by) licUser = await store.getAppUserById(lic.used_by);
      if (!licUser && session.user_id) licUser = await store.getAppUserById(session.user_id);
      let subName = "basic";
      if (lic.level === 2) subName = "VIP";
      if (lic.level === 3) subName = "Combo";
      if (lic.package_name && lic.package_name.trim() !== "" && lic.package_name !== "Bypass") {
        if (lic.package_name.toLowerCase() === "basic") {
          subName = "basic";
        } else if (lic.package_name.toLowerCase() === "vip") {
          subName = "VIP";
        } else {
          subName = lic.package_name;
        }
      }

      const expiryStr = toUnixTimestamp(expiresAt);
      const responseUserData = {
        username: licUser ? licUser.username : key,
        ip: licUser ? licUser.ip : ip,
        hwid: licUser ? (licUser.hwid || hwid || "") : (hwid || ""),
        createdate: toUnixTimestamp(licUser ? licUser.created_at : lic.created_at),
        lastlogin: toUnixTimestamp(licUser ? licUser.last_login : now),
        expiry: expiryStr,
        subscriptions: (
          req.headers.get("x-vahalla-client") === "1.0" || 
          req.headers.get("user-agent")?.includes("Vahalla") || 
          String(p.name).toUpperCase().includes("WHITE") || 
          String(p.name).toUpperCase().includes("BLK") ||
          String(p.name).toUpperCase().includes("XITER")
        ) ? [
          { subscription: "basic", name: "basic", key: key, expiry: expiryStr },
          { subscription: "VIP", name: "VIP", key: key, expiry: expiryStr },
          { subscription: "Combo", name: "Combo", key: key, expiry: expiryStr }
        ] : (
          (lic.level >= 2 || (lic.package_name && lic.package_name.toLowerCase() === "vip")) ? [
            { subscription: "VIP", name: "VIP", key: key, expiry: expiryStr },
            { subscription: "basic", name: "basic", key: key, expiry: expiryStr },
            { subscription: "Combo", name: "Combo", key: key, expiry: expiryStr }
          ] : [
            { subscription: "basic", name: "basic", key: key, expiry: expiryStr },
            { subscription: "VIP", name: "VIP", key: key, expiry: expiryStr },
            { subscription: "Combo", name: "Combo", key: key, expiry: expiryStr }
          ]
        ),
      };

      return json({
        success: true,
        message: "Logged in",
        info: responseUserData,
        userdata: responseUserData,
        user_data: responseUserData,
      });
    }

    if (type === "log" || type === "var") {
      return json({ success: false, message: "Endpoint not yet implemented: " + type }, 501);
    }

    return json({
      success: true,
      message: "KeyAuth API 1.0",
      endpoints: ["init", "login", "register", "license", "log", "var"],
    });
  } catch (e: any) {
    return json({ success: false, message: e?.message || "Server error" }, 500);
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  // Si tiene parámetro type, procesarlo como POST (el SDK de C++ manda GET con query params)
  if (type) {
    return POST(req);
  }
  return json({
    success: false, message: "Method not allowed. Use POST.",
  });
}
