export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
  subscription_end: string | null;
  subscription_app_id: string | null;
  seller_label: string | null;
  created_by?: string | null;
  credits?: number;
  status?: string;
  permissions?: string[];
  subscriptions?: string[];
}

export interface App {
  id: string;
  owner_id: string;
  name: string;
  app_id: string;
  owner_secret: string;
  app_secret: string;
  version: string;
  download_link: string | null;
  webhook_url: string | null;
  status: string;
  seller_id: string | null;
  level?: number;
  created_at: string;
}

export interface AppUser {
  id: string;
  app_id: string;
  username: string;
  email: string | null;
  password_hash: string;
  hwid: string | null;
  ip: string | null;
  last_login: string | null;
  banned: boolean;
  ban_reason: string | null;
  created_at: string;
  balance?: number;
  level?: number;
}

export interface License {
  id: string;
  app_id: string;
  key: string;
  duration_days: number;
  level: number;
  uses: number;
  max_uses: number;
  hwid_lock: boolean;
  ip_lock: boolean;
  status: string;
  used_by: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  package_name?: string;
  note?: string;
}

export interface Session {
  id: string;
  session_id: string;
  app_id: string;
  user_id: string | null;
  ip: string | null;
  hwid: string | null;
  created_at: string;
  expires_at: string;
  valid: boolean;
}

export interface Variable {
  id: string;
  app_id: string;
  name: string;
  value: string;
  authed: boolean;
  created_at: string;
}

export interface Log {
  id: string;
  app_id: string | null;
  user_id: string | null;
  message: string;
  level: string;
  created_at: string;
}

export interface OAuthLink {
  id: string;
  admin_id: string;
  provider: string;
  provider_user_id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Store {
  getAdminByEmail(email: string): Promise<Admin | null>;
  getAdminById(id: string): Promise<Admin | null>;
  createAdmin(data: {
    email: string;
    password_hash: string;
    role: string;
    created_by?: string | null;
    credits?: number;
    status?: string;
    permissions?: string[];
    subscriptions?: string[];
  }): Promise<Admin>;
  updateAdmin(id: string, data: Admin): Promise<Admin | null>;
  deleteAdmin(id: string): Promise<void>;
  listAdmins(): Promise<Admin[]>;

  listApps(filter?: { ownerId?: string; sellerId?: string }): Promise<App[]>;
  getAppById(id: string): Promise<App | null>;
  getAppByAppId(appId: string): Promise<App | null>;
  getAppByName(name: string): Promise<App | null>;
  createApp(data: Omit<App, "id" | "created_at">): Promise<App>;
  updateApp(id: string, data: App): Promise<App | null>;
  deleteApp(id: string): Promise<void>;

  getAppUser(appId: string, username: string): Promise<AppUser | null>;
  getAppUserById(id: string): Promise<AppUser | null>;
  createAppUser(data: Omit<AppUser, "id" | "created_at">): Promise<AppUser>;
  updateAppUser(id: string, data: Partial<AppUser>): Promise<AppUser | null>;
  deleteAppUser(id: string): Promise<void>;
  listAppUsers(filter?: { appId?: string; banned?: boolean; limit?: number }): Promise<AppUser[]>;

  getLicenseByKey(appId: string, key: string): Promise<License | null>;
  getLicenseById(id: string): Promise<License | null>;
  createLicenses(items: Omit<License, "id" | "created_at">[]): Promise<License[]>;
  listLicenses(filter?: { appId?: string; status?: string; limit?: number }): Promise<License[]>;
  updateLicense(id: string, data: Partial<License>): Promise<License | null>;
  deleteLicense(id: string): Promise<void>;

  getSession(sessionId: string): Promise<Session | null>;
  createSession(data: Omit<Session, "id" | "created_at">): Promise<Session>;
  updateSession(sessionId: string, data: Partial<Session>): Promise<Session | null>;
  invalidateSession(sessionId: string): Promise<void>;
  listSessionsForApp(appId: string, limit?: number): Promise<Session[]>;

  listVariables(appId: string): Promise<Variable[]>;
  getVariable(appId: string, name: string): Promise<Variable | null>;
  upsertVariable(appId: string, name: string, value: string, authed: boolean): Promise<Variable>;
  deleteVariable(id: string): Promise<void>;

  createLog(data: Omit<Log, "id" | "created_at">): Promise<void>;
  listLogs(filter?: { appId?: string; level?: string; limit?: number }): Promise<Log[]>;

  getOAuthLink(provider: string, providerUserId: string): Promise<OAuthLink | null>;
  listOAuthLinksForAdmin(adminId: string): Promise<OAuthLink[]>;
  createOAuthLink(data: Omit<OAuthLink, "id" | "created_at">): Promise<OAuthLink>;
  deleteOAuthLink(id: string): Promise<void>;
}
