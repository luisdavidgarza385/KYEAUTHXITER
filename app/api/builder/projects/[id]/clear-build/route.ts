import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

// POST /api/builder/projects/[id]/clear-build
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const p = await getProjectById(params.id);
    if (!p) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    await updateProject(params.id, { lastBuild: { status: 'none', date: new Date().toISOString() } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
