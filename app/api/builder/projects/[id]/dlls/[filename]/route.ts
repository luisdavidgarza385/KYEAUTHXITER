import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string; filename: string } };

// DELETE /api/builder/projects/[id]/dlls/[filename]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    // Decode both %20 and + as spaces
    const filename = decodeURIComponent(params.filename.replace(/\+/g, ' '));
    const nameWithoutExt = filename.replace(/\.dll$/i, '');

    // Delete from Supabase Storage (try both the decoded filename and variations)
    const pathsToTry = [
      `dlls/${params.id}/${filename}`,
      `dlls/${params.id}/${nameWithoutExt}.dll`,
    ];
    for (const path of pathsToTry) {
      try {
        await deleteFile(path);
      } catch (e) {
        console.error(`Error deleting dll from storage path ${path}:`, e);
      }
    }

    // Update project DLL list — match by filename OR by name (without extension)
    const p = await getProjectById(params.id);
    if (p) {
      const updatedDlls = (p.dlls || []).filter((d) => {
        const dFilename = (d.filename || '').toLowerCase().trim();
        const dName = (d.name || '').toLowerCase().trim();
        const searchFilename = filename.toLowerCase().trim();
        const searchName = nameWithoutExt.toLowerCase().trim();
        return dFilename !== searchFilename && dName !== searchName;
      });
      await updateProject(params.id, { dlls: updatedDlls });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
