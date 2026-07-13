import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/builder/projects — listar todos los proyectos
export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/builder/projects — crear proyecto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, process: proc, exeTitle, color, keyAuthName, keyAuthOwner, keyAuthVer, keyAuthSecret } = body;
    if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });

    const newProject = await createProject({
      id: `proj_${Date.now()}`,
      name,
      process: proc || 'HD-Player.exe',
      exeTitle: exeTitle || name,
      color: color || '#9333ea',
      hasIcon: false,
      dlls: [],
      lastBuild: { status: 'none' },
      keyAuthName: keyAuthName || '',
      keyAuthOwner: keyAuthOwner || '',
      keyAuthVer: keyAuthVer || '1.0',
      keyAuthSecret: keyAuthSecret || '',
    });

    return NextResponse.json(newProject);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
