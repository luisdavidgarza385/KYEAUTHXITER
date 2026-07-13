import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

// GET /api/builder/projects/[id]/build-status
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const p = await getProjectById(params.id);
    if (!p) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(p.lastBuild || { status: 'none' });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
