import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, uploadFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: { id: string } };

// POST /api/builder/projects/[id]/icon
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const formData = await req.formData();
    const file = (formData.get('icon') || formData.get('file')) as File | null;
    if (!file) return NextResponse.json({ error: 'No se recibió imagen (icon/file)' }, { status: 400 });

    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || 'png');
    const allowed = ['.png', '.jpg', '.jpeg', '.ico'];
    if (!allowed.includes(ext)) return NextResponse.json({ error: 'Solo PNG/ICO' }, { status: 400 });

    const arrayBuf = await file.arrayBuffer();
    const pngBuf = Buffer.from(arrayBuf);

    // Upload PNG for web display
    await uploadFile(`icons/${params.id}.png`, pngBuf, 'image/png');

    // Create minimal ICO wrapper for the exe (wrap PNG bytes in ICO header)
    const icoHeader = Buffer.alloc(22);
    icoHeader.writeUInt16LE(0, 0);  // Reserved
    icoHeader.writeUInt16LE(1, 2);  // Type = Icon
    icoHeader.writeUInt16LE(1, 4);  // Count = 1
    icoHeader.writeUInt8(0, 6);     // Width = 256
    icoHeader.writeUInt8(0, 7);     // Height = 256
    icoHeader.writeUInt8(0, 8);     // Colors = 0
    icoHeader.writeUInt8(0, 9);     // Reserved = 0
    icoHeader.writeUInt16LE(1, 10); // Planes = 1
    icoHeader.writeUInt16LE(32, 12);// BPP = 32
    icoHeader.writeUInt32LE(pngBuf.length, 14);
    icoHeader.writeUInt32LE(22, 18);
    const icoBuf = Buffer.concat([icoHeader, pngBuf]);

    await uploadFile(`icons/${params.id}.ico`, icoBuf, 'image/x-icon');

    await updateProject(params.id, { hasIcon: true });

    return NextResponse.json({ success: true, url: `/api/builder/files/icons/${params.id}.png` });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/builder/projects/[id]/icon — redirect to file route
export async function GET(_req: NextRequest, { params }: Params) {
  return NextResponse.redirect(`/api/builder/files/icons/${params.id}.png`);
}
