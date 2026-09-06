import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, downloadFile, uploadFile } from '@/lib/dll-supabase';
import { patchExe } from '@/lib/dll-patcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

// POST /api/builder/projects/[id]/compile
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const project = await getProjectById(params.id);
    if (!project) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });

    // Mark as compiling
    await updateProject(project.id, { lastBuild: { status: 'compiling', date: new Date().toISOString() } });

    // Build the API URL that the loader will use to download DLLs.
    // Always use NEXT_PUBLIC_BASE_URL (must be set to https://keyauthpro.xyz in Vercel env vars).
    // VERCEL_URL is intentionally ignored — it points to the deployment-specific URL, not the custom domain.
    let baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');

    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('vercel.app')) {
      // Hard fallback to production domain
      baseUrl = 'https://keyauthpro.xyz';
    }

    const apiUrl = `${baseUrl}/api/projects/${project.id}/dlls`;

    // Attempt to download base_loader.exe
    let baseExeBuf: Buffer | null = null;
    try {
      baseExeBuf = await downloadFile('builds/base_loader.exe');
    } catch {
      // No base loader available
    }

    if (!baseExeBuf) {
      await updateProject(project.id, {
        lastBuild: {
          status: 'error',
          error: 'No hay base_loader.exe. Súbelo primero usando el botón "Subir Base Loader".',
          date: new Date().toISOString(),
        }
      });
      return NextResponse.json({ status: 'error', error: 'No hay base_loader.exe disponible.' });
    }

    // Get project icon if available
    let iconBuf: Buffer | null = null;
    if (project.hasIcon) {
      try {
        iconBuf = await downloadFile(`icons/${project.id}.ico`);
      } catch {}
    }

    const exeName = (project.exeTitle || project.name).replace(/[^a-zA-Z0-9]/g, '_') + '_loader.exe';

    // Patch the exe
    const result = patchExe(baseExeBuf, project, apiUrl, iconBuf);

    if (!result.ok || !result.buffer) {
      await updateProject(project.id, {
        lastBuild: {
          status: 'error',
          error: result.error || 'Error en patcheo',
          date: new Date().toISOString(),
        }
      });
      return NextResponse.json({ status: 'error', error: result.error });
    }

    // Upload patched exe to Supabase Storage
    await uploadFile(`builds/${exeName}`, result.buffer, 'application/octet-stream');

    // Mark as success
    await updateProject(project.id, {
      hasExe: true,
      exeName,
      lastBuild: {
        status: 'success',
        file: exeName,
        date: new Date().toISOString(),
      }
    });

    return NextResponse.json({ status: 'success', file: exeName });
  } catch (err: unknown) {
    try {
      await updateProject(params.id, {
        lastBuild: { status: 'error', error: (err as Error).message, date: new Date().toISOString() }
      });
    } catch {}
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
