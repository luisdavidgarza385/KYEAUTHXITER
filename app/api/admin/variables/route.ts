import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { store } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const appId = new URL(req.url).searchParams.get("app");
    if (!appId) return fail("app required");
    const variables = await store.listVariables(appId);
    return ok(variables);
  } catch (e: any) {
    return fail(e.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { appId, name, value, authed } = await req.json();
    if (!appId || !name) return fail("appId and name required");
    const v = await store.upsertVariable(appId, name, value || "", authed !== false);
    return ok(v);
  } catch (e: any) {
    return fail(e.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return fail("id required");
    await store.deleteVariable(id);
    return ok({ status: true });
  } catch (e: any) {
    return fail(e.message, 500);
  }
}
