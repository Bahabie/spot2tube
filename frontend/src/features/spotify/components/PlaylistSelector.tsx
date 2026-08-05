import { getSpotifyPlaylists } from "../actions";
import { PlaylistCard } from "./PlaylistCard";

export async function PlaylistSelector() {
  try {
    const playlists = await getSpotifyPlaylists();

    if (!playlists || playlists.length === 0) {
      return (
        <div className="p-8 text-center glass-panel rounded-2xl border-white/10">
          <p className="text-gray-400">No playlists found on your Spotify account.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Your Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border-red-500/20 bg-red-500/10">
        <p className="text-red-400">Error loading playlists. Please make sure your Spotify account is connected.</p>
      </div>
    );
  }
}
