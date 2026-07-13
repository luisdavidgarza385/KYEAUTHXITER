import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string; filename: string } };

// DELETE /api/builder/projects/[id]/dlls/[filename]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const filename = decodeURIComponent(params.filename);

    // Delete from Supabase Storage
    try {
      await deleteFile(`dlls/${params.id}/${filename}`);
    } catch (e) {
      console.error('Error deleting dll from storage:', e);
    }

    // Update project DLL list
    const p = await getProjectById(params.id);
    if (p) {
      const updatedDlls = (p.dlls || []).filter((d) => d.filename !== filename);
      await updateProject(params.id, { dlls: updatedDlls });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
