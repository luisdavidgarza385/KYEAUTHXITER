import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/builder/upload-base-loader
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No se recibió el archivo' }, { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    await uploadFile('builds/base_loader.exe', buf, 'application/octet-stream');

    return NextResponse.json({ success: true, message: 'Base loader actualizado con éxito', size: buf.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
