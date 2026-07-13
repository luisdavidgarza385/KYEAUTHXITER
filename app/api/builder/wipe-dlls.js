const DLL_SUPABASE_URL = 'https://gdpxhjtpsvddkzlsywhk.supabase.co';
const DLL_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcHhoanRwc3ZkZGt6bHN5d2hrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTk5NzQwNywiZXhwIjoyMDk3NTczNDA3fQ.zUJEclqDeM0rYozvCjrpFmyUiY8wo3BjPi2pJsOX_mM';

async function run() {
  try {
    // 1. Fetch projects
    console.log("Fetching projects...");
    const getRes = await fetch(`${DLL_SUPABASE_URL}/rest/v1/projects?select=*`, {
      headers: {
        'apikey': DLL_SUPABASE_KEY,
        'Authorization': `Bearer ${DLL_SUPABASE_KEY}`
      }
    });
    if (!getRes.ok) throw new Error("Failed to get projects: " + await getRes.text());
    const projects = await getRes.json();
    console.log(`Found ${projects.length} projects.`);

    for (const proj of projects) {
      console.log(`Clearing dlls list for project: ${proj.name} (id: ${proj.id})...`);
      const updateRes = await fetch(`${DLL_SUPABASE_URL}/rest/v1/projects?id=eq.${encodeURIComponent(proj.id)}`, {
        method: 'PATCH',
        headers: {
          'apikey': DLL_SUPABASE_KEY,
          'Authorization': `Bearer ${DLL_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ dlls: [] })
      });
      if (updateRes.ok) {
        console.log(`Successfully cleared dlls for ${proj.name}.`);
      } else {
        console.error(`Failed to update ${proj.name}: ${await updateRes.text()}`);
      }
    }
    console.log("Database clean completed successfully!");
  } catch (err) {
    console.error(err);
  }
}

run();
