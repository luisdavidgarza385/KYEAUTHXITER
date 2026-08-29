import { NextRequest, NextResponse } from 'next/server';
import {
  getProjectById,
  updateProject,
  deleteProjectById,
  deleteFile,
  listFiles,
} from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

// GET /api/builder/projects/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const p = await getProjectById(params.id);
    if (!p) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(p);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT /api/builder/projects/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const updated = await updateProject(params.id, body);
    if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/builder/projects/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    // Delete all DLL files from storage
    try {
      const files = await listFiles(`dlls/${params.id}/`);
      for (const f of files) {
        await deleteFile(`dlls/${params.id}/${f.name}`);
      }
    } catch {}
    // Delete icons
    try { await deleteFile(`icons/${params.id}.png`); } catch {}
    try { await deleteFile(`icons/${params.id}.ico`); } catch {}

    await deleteProjectById(params.id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
