const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const { createClient } = require("@supabase/supabase-js");

async function main() {
  console.log("Supabase URL:", env.NEXT_PUBLIC_SUPABASE_URL);
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data, error } = await supabase.from("admin_users").select("*");
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users in admin_users:", data);
  }
}

main().catch(console.error);
