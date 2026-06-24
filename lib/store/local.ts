import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type {
  Admin,
  App,
  AppUser,
  License,
  Log,
  OAuthLink,
  Session,
  Store,
  Variable,
  SubscriptionPlan,
  Subscriber,
  Seller,
} from "./types";

interface LocalDb {
  admins: Admin[];
  apps: App[];
  app_users: AppUser[];
  licenses: License[];
  sessions: Session[];
  variables: Variable[];
  logs: Log[];
  oauth_links: OAuthLink[];
  global_vars: any[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DB extends LocalDb {}

let writeQueue: Promise<unknown> = Promise.resolve();
let bootstrapped = false;

async function read(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DB;
    if (!parsed.oauth_links) parsed.oauth_links = [];
    return parsed;
  } catch {
    return {
      admins: [],
      apps: [],
      app_users: [],
      licenses: [],
      sessions: [],
      variables: [],
      logs: [],
      oauth_links: [],
      global_vars: [],
    };
  }
}

async function persist(db: LocalDb) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const raw = JSON.stringify(db, null, 2);
  await fs.writeFile(DB_FILE, raw, "utf-8");
}

async function withWrite<T>(fn: (db: LocalDb) => Promise<T> | T): Promise<T> {
  const prev = writeQueue;
  let release: () => void = () => {};
  writeQueue = new Promise<void>((r) => (release = r));
  await prev;
  const db = await read();
  try {
    const result = await fn(db);
    await persist(db);
    return result;
  } finally {
    release();
  }
}

function id(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

function now(): string {
  return new Date().toISOString();
}

async function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const pw = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (email && pw) {
    const db = await read();
    if (!db.admins.find((a) => a.email === email)) {
      db.admins.push({
        id: id(),
        email,
        password_hash: await bcrypt.hash(pw, 10),
        role: "admin",
        created_at: now(),
        subscription_end: null,
        subscription_app_id: null,
        seller_label: "keyauthpro",
      });
      await persist(db);
    }
  }
}

export const localStore: Store = {
  async getAdminByEmail(email) {
    await bootstrap();
    const e = email.toLowerCase();
    const db = await read();
    return db.admins.find((a) => a.email.toLowerCase() === e) || null;
  },

  async getAdminById(id) {
    await bootstrap();
    const db = await read();
    return db.admins.find((a) => a.id === id) || null;
  },

  async createAdmin(data) {
    return withWrite(async (db) => {
      const admin: Admin = {
        id: id(),
        email: data.email.toLowerCase(),
        password_hash: data.password_hash,
        role: data.role,
        created_at: now(),
        subscription_end: null,
        subscription_app_id: null,
        seller_label: data.role === "seller" ? data.email.toLowerCase() : "keyauthpro",
        created_by: data.created_by || null,
        credits: typeof data.credits === "number" ? data.credits : 0,
        status: data.status || "Activo",
        permissions: data.permissions || [],
        subscriptions: data.subscriptions || [],
      };
      db.admins.push(admin);
      return admin;
    });
  },

  async updateAdmin(id, data) {
    return withWrite(async (db) => {
      const idx = db.admins.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      db.admins[idx] = data;
      return data;
    });
  },

  async deleteAdmin(id) {
    return withWrite(async (db) => {
      const idx = db.admins.findIndex((a) => a.id === id);
      if (idx !== -1) db.admins.splice(idx, 1);
      for (const a of db.apps) {
        if (a.seller_id === id) a.seller_id = null;
      }
    });
  },

  async listAdmins() {
    await bootstrap();
    return (await read()).admins;
  },

  async listApps(filter) {
    const db = await read();
    let apps = db.apps;
    if (filter?.ownerId) apps = apps.filter((a) => a.owner_id === filter.ownerId);
    if (filter?.sellerId) apps = apps.filter((a) => a.seller_id === filter.sellerId);
    return apps.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getAppById(id) {
    return (await read()).apps.find((a) => a.id === id) || null;
  },

  async getAppByAppId(appId) {
    return (await read()).apps.find((a) => a.app_id === appId) || null;
  },

  async getAppByName(name) {
    return (await read()).apps.find((a) => a.name === name) || null;
  },

  async createApp(data) {
    return withWrite(async (db) => {
      const app: App = {
        ...data,
        id: id(),
        created_at: now(),
      };
      db.apps.push(app);
      return app;
    });
  },

  async updateApp(id, data) {
    return withWrite(async (db) => {
      const idx = db.apps.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      db.apps[idx] = data;
      return data;
    });
  },

  async deleteApp(id) {
    return withWrite(async (db) => {
      const idx = db.apps.findIndex((a) => a.id === id);
      if (idx === -1) return;
      db.apps.splice(idx, 1);
      db.licenses = db.licenses.filter((l) => l.app_id !== id);
      db.app_users = db.app_users.filter((u) => u.app_id !== id);
      db.sessions = db.sessions.filter((s) => s.app_id !== id);
      db.variables = db.variables.filter((v) => v.app_id !== id);
      db.logs = db.logs.filter((l) => l.app_id !== id);
    });
  },

  async getAppUser(appId, username) {
    return (await read()).app_users.find(
      (u) => u.app_id === appId && u.username === username
    ) || null;
  },

  async getAppUserById(id) {
    return (await read()).app_users.find((u) => u.id === id) || null;
  },

  async createAppUser(data) {
    return withWrite(async (db) => {
      const user: AppUser = {
        ...data,
        id: id(),
        created_at: now(),
      };
      db.app_users.push(user);
      return user;
    });
  },

  async updateAppUser(id, data) {
    return withWrite(async (db) => {
      const idx = db.app_users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      db.app_users[idx] = { ...db.app_users[idx], ...data };
      return db.app_users[idx];
    });
  },

  async deleteAppUser(id) {
    return withWrite(async (db) => {
      const idx = db.app_users.findIndex((u) => u.id === id);
      if (idx !== -1) db.app_users.splice(idx, 1);
    });
  },

  async listAppUsers(filter) {
    let users = (await read()).app_users;
    if (filter?.appId) users = users.filter((u) => u.app_id === filter.appId);
    if (filter?.banned !== undefined) users = users.filter((u) => u.banned === filter.banned);
    users = users.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    return users.slice(0, filter?.limit || 200);
  },

  async getLicenseByKey(appId, key) {
    return (await read()).licenses.find(
      (l) => l.app_id === appId && l.key === key
    ) || null;
  },

  async getLicenseById(id) {
    return (await read()).licenses.find((l) => l.id === id) || null;
  },

  async createLicenses(items) {
    return withWrite(async (db) => {
      const created: License[] = items.map((item) => ({
        ...item,
        id: id(),
        created_at: now(),
      }));
      db.licenses.push(...created);
      return created;
    });
  },

  async listLicenses(filter) {
    let licenses = (await read()).licenses;
    if (filter?.appId) licenses = licenses.filter((l) => l.app_id === filter.appId);
    if (filter?.status) licenses = licenses.filter((l) => l.status === filter.status);
    licenses = licenses.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    return licenses.slice(0, filter?.limit || 200);
  },

  async updateLicense(id, data) {
    return withWrite(async (db) => {
      const idx = db.licenses.findIndex((l) => l.id === id);
      if (idx === -1) return null;
      db.licenses[idx] = { ...db.licenses[idx], ...data };
      return db.licenses[idx];
    });
  },

  async deleteLicense(id) {
    return withWrite(async (db) => {
      const idx = db.licenses.findIndex((l) => l.id === id);
      if (idx !== -1) db.licenses.splice(idx, 1);
    });
  },

  async getSession(sessionId) {
    const s = (await read()).sessions.find((s) => s.session_id === sessionId);
    if (!s) return null;
    if (!s.valid) return null;
    if (new Date(s.expires_at) < new Date()) return null;
    return s;
  },

  async createSession(data) {
    const session = { ...data, id: id(), created_at: now() };
    return withWrite(async (db) => {
      db.sessions.push(session);
      return session;
    });
  },

  async updateSession(sessionId, data) {
    return withWrite(async (db) => {
      const idx = db.sessions.findIndex((s) => s.session_id === sessionId);
      if (idx === -1) return null;
      db.sessions[idx] = { ...db.sessions[idx], ...data };
      return db.sessions[idx];
    });
  },

  async invalidateSession(sessionId) {
    return withWrite(async (db) => {
      const s = db.sessions.find((s) => s.session_id === sessionId);
      if (s) s.valid = false;
    });
  },

  async listSessionsForApp(appId, limit = 50) {
    const now = new Date();
    return (await read())
      .sessions.filter(
        (s) => s.app_id === appId && s.valid && new Date(s.expires_at) > now
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  },

  async listVariables(appId) {
    return (await read())
      .variables.filter((v) => v.app_id === appId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getVariable(appId, name) {
    return (await read()).variables.find(
      (v) => v.app_id === appId && v.name === name
    ) || null;
  },

  async upsertVariable(appId, name, value, authed) {
    return withWrite(async (db) => {
      const existing = db.variables.find(
        (v) => v.app_id === appId && v.name === name
      );
      if (existing) {
        existing.value = value;
        existing.authed = authed;
        return existing;
      }
      const v: Variable = {
        id: id(),
        app_id: appId,
        name,
        value,
        authed,
        created_at: now(),
      };
      db.variables.push(v);
      return v;
    });
  },

  async deleteVariable(id) {
    return withWrite(async (db) => {
      const idx = db.variables.findIndex((v) => v.id === id);
      if (idx !== -1) db.variables.splice(idx, 1);
    });
  },

  async createLog(data) {
    return withWrite(async (db) => {
      db.logs.push({
        ...data,
        id: id(),
        created_at: now(),
      });
      if (db.logs.length > 5000) {
        db.logs = db.logs.slice(-5000);
      }
    });
  },

  async listLogs(filter) {
    let logs = (await read()).logs;
    if (filter?.appId) logs = logs.filter((l) => l.app_id === filter.appId);
    if (filter?.level) logs = logs.filter((l) => l.level === filter.level);
    logs = logs.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    return logs.slice(0, filter?.limit || 300);
  },

  async getOAuthLink(provider, providerUserId) {
    const db = await read();
    return db.oauth_links.find((l) => l.provider === provider && l.provider_user_id === providerUserId) || null;
  },

  async listOAuthLinksForAdmin(adminId) {
    const db = await read();
    return db.oauth_links.filter((l) => l.admin_id === adminId);
  },

  async createOAuthLink(data) {
    return withWrite(async (db) => {
      const link: OAuthLink = {
        ...data,
        id: id(),
        created_at: now(),
      };
      db.oauth_links.push(link);
      return link;
    });
  },

  async deleteOAuthLink(id) {
    return withWrite(async (db) => {
      const idx = db.oauth_links.findIndex((l) => l.id === id);
      if (idx !== -1) db.oauth_links.splice(idx, 1);
    });
  },

  // Subscription Plans - Not supported in local store
  async getSubscriptionPlanById() {
    throw new Error("Subscription plans require Supabase");
  },
  async getSubscriptionPlansByAppId() {
    throw new Error("Subscription plans require Supabase");
  },
  async createSubscriptionPlan() {
    throw new Error("Subscription plans require Supabase");
  },
  async updateSubscriptionPlan() {
    throw new Error("Subscription plans require Supabase");
  },
  async deleteSubscriptionPlan() {
    throw new Error("Subscription plans require Supabase");
  },

  // Subscribers - Not supported in local store
  async getSubscriberById() {
    throw new Error("Subscribers require Supabase");
  },
  async getSubscriberByUsername() {
    throw new Error("Subscribers require Supabase");
  },
  async listSubscribers() {
    throw new Error("Subscribers require Supabase");
  },
  async createSubscriber() {
    throw new Error("Subscribers require Supabase");
  },
  async updateSubscriber() {
    throw new Error("Subscribers require Supabase");
  },
  async deleteSubscriber() {
    throw new Error("Subscribers require Supabase");
  },

  // Sellers - Not supported in local store
  async getSellerById() {
    throw new Error("Sellers require Supabase");
  },
  async getSellerByKey() {
    throw new Error("Sellers require Supabase");
  },
  async listSellers() {
    throw new Error("Sellers require Supabase");
  },
  async createSeller() {
    throw new Error("Sellers require Supabase");
  },
  async updateSeller() {
    throw new Error("Sellers require Supabase");
  },
  async deleteSeller() {
    throw new Error("Sellers require Supabase");
  },
};
