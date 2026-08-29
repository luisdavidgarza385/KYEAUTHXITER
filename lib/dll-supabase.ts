/**
 * dll-supabase.ts
 * Conecta con el Supabase del servidor DLL (diferente al Supabase de KeyAuth)
 * URL: https://gdpxhjtpsvddkzlsywhk.supabase.co
 * Bucket: loader-assets
 */

const DLL_SUPABASE_URL  = process.env.DLL_SUPABASE_URL  || 'https://gdpxhjtpsvddkzlsywhk.supabase.co';
const DLL_SUPABASE_KEY  = process.env.DLL_SUPABASE_KEY  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcHhoanRwc3ZkZGt6bHN5d2hrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk5NzQwNywiZXhwIjoyMDk3NTczNDA3fQ.zUJEclqDeM0rYozvCjrpFmyUiY8wo3BjPi2pJsOX_mM';
const DLL_BUCKET        = process.env.DLL_SUPABASE_BUCKET || 'loader-assets';

export { DLL_SUPABASE_URL, DLL_SUPABASE_KEY, DLL_BUCKET };

// ── Low-level fetch helper ──────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

interface SupabaseResponse {
  ok: boolean;
  status: number;
  buffer: Buffer;
  text: () => string;
  json: () => unknown;
}

export async function requestSupabase(apiPath: string, options: RequestOptions = {}): Promise<SupabaseResponse> {
  const url = `${DLL_SUPABASE_URL}${apiPath}`;
  const headers: Record<string, string> = {
    'apikey': DLL_SUPABASE_KEY,
    'Authorization': `Bearer ${DLL_SUPABASE_KEY}`,
    ...(options.headers || {}),
  };

  let body: string | undefined;
  if (options.body !== undefined) {
    body = JSON.stringify(options.body);
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
    cache: 'no-store',
  });

  const buf = Buffer.from(await res.arrayBuffer());
  return {
    ok: res.ok,
    status: res.status,
    buffer: buf,
    text: () => buf.toString('utf8'),
    json: () => JSON.parse(buf.toString('utf8')),
  };
}

// ── Storage helpers ─────────────────────────────────────────────────────────

export async function uploadFile(pathname: string, data: Buffer, contentType = 'application/octet-stream') {
  // Try upsert (overwrite) first, then insert
  const headers: Record<string, string> = {
    'x-upsert': 'true',
    'Content-Type': contentType,
  };

  const res = await fetch(`${DLL_SUPABASE_URL}/storage/v1/object/${DLL_BUCKET}/${pathname}`, {
    method: 'POST',
    headers: {
      'apikey': DLL_SUPABASE_KEY,
      'Authorization': `Bearer ${DLL_SUPABASE_KEY}`,
      ...headers,
    },
    body: new Uint8Array(data),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`uploadFile error ${res.status}: ${text}`);
  }
}

export async function downloadFile(pathname: string): Promise<Buffer> {
  const res = await fetch(`${DLL_SUPABASE_URL}/storage/v1/object/authenticated/${DLL_BUCKET}/${pathname}`, {
    headers: {
      'apikey': DLL_SUPABASE_KEY,
      'Authorization': `Bearer ${DLL_SUPABASE_KEY}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`downloadFile error ${res.status} for ${pathname}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function deleteFile(pathname: string) {
  const res = await fetch(`${DLL_SUPABASE_URL}/storage/v1/object/${DLL_BUCKET}`, {
    method: 'DELETE',
    headers: {
      'apikey': DLL_SUPABASE_KEY,
      'Authorization': `Bearer ${DLL_SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: [pathname] }),
    cache: 'no-store',
  });
  // 200 or 204 = ok, ignore 404
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    console.error(`deleteFile warning ${res.status}: ${text}`);
  }
}

export async function listFiles(prefix: string): Promise<{ name: string; size: number; uploadedAt: string }[]> {
  const res = await fetch(`${DLL_SUPABASE_URL}/storage/v1/object/list/${DLL_BUCKET}`, {
    method: 'POST',
    headers: {
      'apikey': DLL_SUPABASE_KEY,
      'Authorization': `Bearer ${DLL_SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefix, limit: 100, options: { recursive: true } }),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json() as Array<{ name: string; metadata?: { size?: number }; created_at?: string; updated_at?: string }>;
  return data.map(f => ({
    name: f.name,
    size: f.metadata?.size || 0,
    uploadedAt: f.created_at || f.updated_at || new Date().toISOString(),
  }));
}

// ── DB helpers ──────────────────────────────────────────────────────────────

export interface DllInfo {
  id: number;
  name: string;
  filename: string;
  size: number;
  url: string;
  updated: string;
}

export interface Project {
  id: string;
  name: string;
  exeTitle: string;
  process: string;
  color: string;
  hasIcon?: boolean;
  hasExe?: boolean;
  exeName?: string;
  dlls?: DllInfo[];
  lastBuild?: {
    status: string;
    file?: string;
    error?: string;
    date?: string;
    keyAuth?: {
      name?: string;
      owner?: string;
      ver?: string;
      secret?: string;
    };
  };
  keyAuthName?: string;
  keyAuthOwner?: string;
  keyAuthVer?: string;
  keyAuthSecret?: string;
}

function toAppProject(dbProj: Record<string, unknown>): Project {
  const p = { ...dbProj } as Record<string, unknown>;
  // hasFee → hasExe alias
  if ('hasFee' in p) { p.hasExe = p.hasFee; delete p.hasFee; }
  // Restore keyAuth from lastBuild JSONB
  const lb = p.lastBuild as { keyAuth?: { name?: string; owner?: string; ver?: string; secret?: string } } | undefined;
  if (lb?.keyAuth) {
    p.keyAuthName   = lb.keyAuth.name;
    p.keyAuthOwner  = lb.keyAuth.owner;
    p.keyAuthVer    = lb.keyAuth.ver;
    p.keyAuthSecret = lb.keyAuth.secret;
  }
  return p as unknown as Project;
}

function toDbProject(appProj: Partial<Project>): Record<string, unknown> {
  const p = { ...appProj } as Record<string, unknown>;
  // hasExe → hasFee alias
  if ('hasExe' in p) { p.hasFee = p.hasExe; delete p.hasExe; }
  // Serialize keyAuth into lastBuild JSONB (avoids missing column errors)
  if (appProj.keyAuthName !== undefined || appProj.keyAuthOwner !== undefined || appProj.keyAuthSecret !== undefined) {
    const existing = (p.lastBuild as Record<string, unknown>) || {};
    p.lastBuild = {
      ...existing,
      keyAuth: {
        name:   appProj.keyAuthName   || '',
        owner:  appProj.keyAuthOwner  || '',
        ver:    appProj.keyAuthVer    || '1.0',
        secret: appProj.keyAuthSecret || '',
      }
    };
    delete p.keyAuthName;
    delete p.keyAuthOwner;
    delete p.keyAuthVer;
    delete p.keyAuthSecret;
  }
  return p;
}

export async function getAllProjects(): Promise<Project[]> {
  const res = await requestSupabase('/rest/v1/projects?select=*');
  if (res.ok) {
    const data = res.json() as Record<string, unknown>[];
    return data.map(toAppProject);
  }
  return [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const res = await requestSupabase(`/rest/v1/projects?id=eq.${encodeURIComponent(id)}&select=*`);
  if (res.ok) {
    const data = res.json() as Record<string, unknown>[];
    return data[0] ? toAppProject(data[0]) : null;
  }
  return null;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const dbProj = toDbProject(project);
  const res = await requestSupabase('/rest/v1/projects', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: dbProj,
  });
  if (res.ok) {
    const data = res.json() as Record<string, unknown>[];
    return toAppProject(data[0]);
  }
  throw new Error(`createProject failed ${res.status}: ${res.text()}`);
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  const dbData = toDbProject(data);
  const res = await requestSupabase(`/rest/v1/projects?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=representation' },
    body: dbData,
  });
  if (res.ok) {
    const updated = res.json() as Record<string, unknown>[];
    return updated[0] ? toAppProject(updated[0]) : null;
  }
  console.error(`updateProject failed ${res.status}: ${res.text()}`);
  return null;
}

export async function deleteProjectById(id: string): Promise<void> {
  await requestSupabase(`/rest/v1/projects?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}
