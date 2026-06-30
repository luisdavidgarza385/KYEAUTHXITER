import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { supabaseAdmin } from "../lib/supabase/admin";

async function main() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase.from("admin_users").select("*");
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users in admin_users:", data);
  }
}

main().catch(console.error);
