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

async function main() {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/admin_users?select=*`;
  console.log("Fetching users from:", url);

  const res = await fetch(url, {
    headers: {
      "apikey": env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("HTTP error:", res.status, text);
    return;
  }

  const data = await res.json();
  console.log("Users in database:", data);
}

main().catch(console.error);
