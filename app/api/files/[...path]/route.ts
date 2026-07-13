import { NextRequest, NextResponse } from 'next/server';
import { downloadFile, updateProject, getAllProjects } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Servir archivos desde Supabase Storage tanto en ruta unificada /api/builder/files/[...path] como /api/files/[...path] para compatibilidad de descargas del loader C++
export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathParts = params.path;
  const pathname = pathParts.join('/');

  try {
    const buf = await downloadFile(pathname);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    const lower = pathname.toLowerCase();
    if (lower.endsWith('.png')) contentType = 'image/png';
    else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (lower.endsWith('.ico')) contentType = 'image/x-icon';

    // Auto-reset build status after serving an exe (build file)
    if (pathParts[0] === 'builds' && lower.endsWith('.exe')) {
      try {
        const filename = pathParts[pathParts.length - 1];
        const projects = await getAllProjects();
        const matched = projects.find(
          p => p.exeName === filename || p.lastBuild?.file === filename
        );
        if (matched) {
          await updateProject(matched.id, {
            lastBuild: { status: 'none', date: new Date().toISOString() }
          });
        }
      } catch {}
    }

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };

    if (lower.endsWith('.exe') || lower.endsWith('.dll')) {
      const filename = pathParts[pathParts.length - 1];
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(filename)}"`;
    }

    return new NextResponse(new Uint8Array(buf), { headers });
  } catch {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
  }
}
