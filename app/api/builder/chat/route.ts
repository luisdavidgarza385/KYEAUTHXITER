import { NextRequest, NextResponse } from 'next/server';
import { downloadFile, uploadFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CHAT_FILE = 'chat_messages.json';
const MAX_MESSAGES = 100;
const ADMIN_KEY = 'Dark Hacks-L60K-VT2U-T7QK-00MV';

type ChatMessage = {
  id: string;
  username: string;
  role: string;
  text: string;
  audio_url?: string;
  timestamp: string;
  date: string;
};

type ChatStore = Record<string, ChatMessage[]>;

async function loadChat(): Promise<ChatStore> {
  try {
    const buf = await downloadFile(CHAT_FILE);
    const data = JSON.parse(buf.toString('utf8'));
    if (Array.isArray(data)) return { global: data };
    return data;
  } catch {
    return { global: [] };
  }
}

async function saveChat(store: ChatStore) {
  const buf = Buffer.from(JSON.stringify(store, null, 2));
  await uploadFile(CHAT_FILE, buf, 'application/json');
}

// GET /api/builder/chat?channel=...
export async function GET(req: NextRequest) {
  const channel = req.nextUrl.searchParams.get('channel') || 'global';
  try {
    const store = await loadChat();
    return NextResponse.json({ messages: store[channel] || [] });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

// POST /api/builder/chat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, text, audio_url, key, channel: bodyChannel } = body;
    const channel = bodyChannel || req.nextUrl.searchParams.get('channel') || 'global';

    if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });
    if (!text && !audio_url) return NextResponse.json({ error: 'Text or audio_url required' }, { status: 400 });

    const clean = username.trim().toLowerCase();
    if ((clean === 'david' || clean === 'xdavid') && key !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Nombre reservado para el Desarrollador.' }, { status: 403 });
    }

    let role = 'user';
    if (key === ADMIN_KEY || clean === 'david' || clean === 'xdavid') role = 'developer';
    else if (clean === 'siki' || clean === 'admin') role = 'admin';

    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      username,
      role,
      text: text || '',
      audio_url: audio_url || '',
      timestamp: `${h}:${m}`,
      date: now.toISOString(),
    };

    const store = await loadChat();
    if (!store[channel]) store[channel] = [];
    store[channel].push(newMsg);
    if (store[channel].length > MAX_MESSAGES) store[channel].shift();

    await saveChat(store);
    return NextResponse.json({ success: true, message: newMsg });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/builder/chat — clear channel (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, channel: bodyChannel } = body;
    const channel = bodyChannel || req.nextUrl.searchParams.get('channel') || 'global';

    if (key !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const store = await loadChat();
    store[channel] = [];
    await saveChat(store);
    return NextResponse.json({ success: true, cleared: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
