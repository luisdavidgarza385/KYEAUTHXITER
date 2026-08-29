export type Application = {
  id: string;
  name: string;
  app_id: string;
  owner_secret: string;
  app_secret: string;
  version: string;
  download_link: string | null;
  webhook_url: string | null;
  status: "active" | "paused" | "banned";
  seller_id: string | null;
  level?: number;
  created_at: string;
};

export type AppUser = {
  id: string;
  app_id: string;
  username: string;
  email: string | null;
  hwid: string | null;
  ip: string | null;
  last_login: string | null;
  banned: boolean;
  ban_reason: string | null;
  created_at: string;
};

export type License = {
  id: string;
  app_id: string;
  key: string;
  duration_days: number;
  level: number;
  uses: number;
  max_uses: number;
  hwid_lock: boolean;
  ip_lock: boolean;
  status: "unused" | "used" | "banned";
  used_by: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type Session = {
  session_id: string;
  app_id: string;
  user_id: string | null;
  ip: string | null;
  hwid: string | null;
  created_at: string;
  expires_at: string;
  valid: boolean;
};
