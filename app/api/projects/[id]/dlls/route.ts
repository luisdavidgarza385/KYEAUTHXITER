import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

// GET /api/projects/[id]/dlls
// Formatea las URLs para que los loaders antiguos apunten a /api/files en vez de /api/builder/files
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const p = await getProjectById(params.id);
    if (!p) return NextResponse.json([]);
    
    // Obtener la URL base de la request
    const origin = req.nextUrl.origin;

    const dlls = (p.dlls || []).map((d) => {
      // Reescribir la URL para que use /api/files/...
      const oldUrl = d.url;
      const rewrittenPath = oldUrl.includes('/api/builder/files/')
        ? oldUrl.replace('/api/builder/files/', '/api/files/')
        : oldUrl;
        
      return {
        ...d,
        url: `${origin}${rewrittenPath}`,
      };
    });

    return NextResponse.json(dlls);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
