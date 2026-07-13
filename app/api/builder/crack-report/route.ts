import { NextRequest, NextResponse } from 'next/server';
import { downloadFile, uploadFile } from '@/lib/dll-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REPORT_FILE = 'crack_reports.json';

async function loadReports(): Promise<any[]> {
  try {
    const buf = await downloadFile(REPORT_FILE);
    return JSON.parse(buf.toString('utf8'));
  } catch {
    return [];
  }
}

async function saveReports(reports: any[]) {
  const buf = Buffer.from(JSON.stringify(reports, null, 2));
  await uploadFile(REPORT_FILE, buf, 'application/json');
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const body = await req.json().catch(() => ({}));
    
    const report = {
      time: new Date().toISOString(),
      ip,
      pcName: body.pcName || 'unknown',
      username: body.username || 'unknown',
      reason: body.reason || 'debugger',
      hwid: body.hwid || 'unknown'
    };

    const reports = await loadReports();
    reports.unshift(report);
    if (reports.length > 200) reports.pop();
    await saveReports(reports);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { searchParams } = req.nextUrl;
    
    const report = {
      time: new Date().toISOString(),
      ip,
      pcName: searchParams.get('pcName') || 'unknown',
      username: searchParams.get('username') || 'unknown',
      reason: searchParams.get('reason') || 'debugger',
      hwid: searchParams.get('hwid') || 'unknown'
    };

    const reports = await loadReports();
    reports.unshift(report);
    if (reports.length > 200) reports.pop();
    await saveReports(reports);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
