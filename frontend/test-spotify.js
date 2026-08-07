async function test() {
  const res = await fetch("https://api.spotify.com/v1/users/spotify/playlists?limit=1");
  const data = await res.json();
  console.log(JSON.stringify(data.items[0], null, 2));
}
test();
