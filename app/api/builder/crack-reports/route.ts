import { NextResponse } from 'next/server';
import { downloadFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REPORT_FILE = 'crack_reports.json';

export async function GET() {
  try {
    const buf = await downloadFile(REPORT_FILE);
    const reports = JSON.parse(buf.toString('utf8'));
    return NextResponse.json(reports);
  } catch {
    return NextResponse.json([]);
  }
}
