const fetch = require('node-fetch'); // Next.js Polyfill is used internally, but let's just use global fetch if Node 20
async function run() {
  const res = await fetch('https://hhhdqyynmzhyrrpdyror.supabase.co/rest/v1/sync_jobs', {
    method: 'POST',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaGRxeXlubXpoeXJycGR5cm9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAwMDA3MiwiZXhwIjoyMTAwNTc2MDcyfQ.cPiRlWfIg5IHZoIVYEuCtE-R41F2uY8xsGcT0Gv0gZs',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaGRxeXlubXpoeXJycGR5cm9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAwMDA3MiwiZXhwIjoyMTAwNTc2MDcyfQ.cPiRlWfIg5IHZoIVYEuCtE-R41F2uY8xsGcT0Gv0gZs',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: 'a23560c4-def7-4982-9de2-2ffe6632da3e',
      spotify_playlist_id: 'test',
      status: 'PENDING',
      progress_percentage: 0
    })
  });
  console.log(res.status, await res.text());
}
run();
