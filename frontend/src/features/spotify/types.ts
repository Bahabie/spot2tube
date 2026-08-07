export interface SpotifyApiPlaylist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks?: {
    href?: string;
    total: number;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracksCount: number;
}
