import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, uploadFile, downloadFile, deleteFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Params = { params: { id: string } };

// GET /api/builder/projects/[id]/dlls
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const p = await getProjectById(params.id);
    if (!p) return NextResponse.json([]);
    return NextResponse.json(p.dlls || []);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST /api/builder/projects/[id]/dlls  — upload DLL
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const formData = await req.formData();
    const file = (formData.get('dll') || formData.get('file')) as File | null;
    if (!file) return NextResponse.json({ error: 'No se recibió ningún archivo (dll/file)' }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'dll') return NextResponse.json({ error: 'Solo .dll' }, { status: 400 });

    const arrayBuf = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    // Upload to Supabase Storage
    await uploadFile(`dlls/${params.id}/${file.name}`, buf, 'application/octet-stream');

    // Update project DLL list
    const p = await getProjectById(params.id);
    if (p) {
      let updatedDlls = (p.dlls || []).filter((d) => d.filename !== file.name);
      const newDll = {
        id: 0,
        name: file.name.replace(/\.dll$/i, ''),
        filename: file.name,
        size: buf.length,
        url: `/api/builder/files/dlls/${params.id}/${encodeURIComponent(file.name)}`,
        updated: new Date().toISOString(),
      };
      updatedDlls.push(newDll);

      // Sort: basic first
      updatedDlls.sort((a, b) => {
        const aBasic = a.filename.toLowerCase().includes('basico') || a.filename.toLowerCase().includes('basic');
        const bBasic = b.filename.toLowerCase().includes('basico') || b.filename.toLowerCase().includes('basic');
        if (aBasic && !bBasic) return -1;
        if (!aBasic && bBasic) return 1;
        return a.filename.localeCompare(b.filename);
      });

      updatedDlls = updatedDlls.map((d, i) => ({ ...d, id: i + 1 }));
      await updateProject(params.id, { dlls: updatedDlls });
    }

    return NextResponse.json({ success: true, filename: file.name, size: buf.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
