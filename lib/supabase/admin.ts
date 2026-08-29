import { createClient as createBaseClient } from "@supabase/supabase-js";

let cached: ReturnType<typeof createBaseClient> | null = null;

export const supabaseAdmin = () => {
  if (cached) return cached;
  cached = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  return cached;
};
