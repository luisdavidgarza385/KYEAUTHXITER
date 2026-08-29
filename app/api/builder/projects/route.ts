import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/dll-supabase';
import { getCurrentAdmin, getScopedAppIds } from '@/lib/auth';
import { store } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/builder/projects — listar todos los proyectos
export async function GET() {
  try {
    const me = await getCurrentAdmin();
    if (!me) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const projects = await getAllProjects();

    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "spectralx@gmail.com";
    if (me.email === bootstrapEmail || me.role === 'admin') {
      return NextResponse.json(projects, { headers: { 'Cache-Control': 'no-store' } });
    }

    const scopedIds = await getScopedAppIds(me);
    if (!scopedIds || scopedIds.length === 0) {
      return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
    }

    // Obtener las apps asignadas al revendedor
    const allowedApps = await Promise.all(
      scopedIds.map(id => store.getAppById(id))
    );
    const allowedNames = allowedApps
      .filter(Boolean)
      .map(app => app!.name.toLowerCase());

    const filtered = projects.filter(p => {
      const pName = (p.name || '').toLowerCase();
      const kaName = (p.keyAuthName || '').toLowerCase();
      return allowedNames.includes(pName) || allowedNames.includes(kaName);
    });

    return NextResponse.json(filtered, { headers: { 'Cache-Control': 'no-store' } });
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
