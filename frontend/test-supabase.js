const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/bahabie/Desktop/spot2tube-sync/frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data, error } = await supabasePublic
    .from("sync_jobs")
    .insert([
      {
        user_id: "00000000-0000-0000-0000-000000000000",
        spotify_playlist_id: "test",
        status: "PENDING",
        progress_percentage: 0,
      },
    ])
    .select("id")
    .single();

  console.log("Error:", error);
}

test();
