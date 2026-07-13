import { NextResponse } from 'next/server';
import { getAllProjects, updateProject } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await getAllProjects();
    const results = [];
    for (const p of projects) {
      await updateProject(p.id, { dlls: [] });
      results.push(`Cleared ${p.name}`);
    }
    return NextResponse.json({ success: true, cleared: results });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
