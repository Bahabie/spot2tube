const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://hhhdqyynmzhyrrpdyror.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaGRxeXlubXpoeXJycGR5cm9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAwMDA3MiwiZXhwIjoyMTAwNTc2MDcyfQ.cPiRlWfIg5IHZoIVYEuCtE-R41F2uY8xsGcT0Gv0gZs";

const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const { data, error } = await supabasePublic
    .from("sync_jobs")
    .insert([
      {
        user_id: "a23560c4-def7-4982-9de2-2ffe6632da3e",
        spotify_playlist_id: "test",
        status: "PENDING",
        progress_percentage: 0,
      },
    ])
    .select("id")
    .single();

  console.log("Error:", JSON.stringify(error, null, 2));
  console.log("Data:", data);
}

test();
