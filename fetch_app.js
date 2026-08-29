const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchApps() {
    const { data, error } = await supabase
        .from('applications')
        .select('*');
        
    if (error) {
        console.error('Error fetching apps:', error);
        return;
    }
    
    console.log(JSON.stringify(data, null, 2));
}

fetchApps();
