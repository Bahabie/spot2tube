-- Add sync direction to sync_jobs table

ALTER TABLE public.sync_jobs 
ADD COLUMN IF NOT EXISTS sync_direction text NOT NULL DEFAULT 'spotify_to_youtube';

-- Rename the meaning of spotify_playlist_id and youtube_playlist_id conceptually,
-- or add new generic columns. To avoid breaking existing code, we will just add the sync_direction
-- and continue to use spotify_playlist_id as the Spotify ID (regardless of source/dest)
-- and youtube_playlist_id as the YouTube ID (regardless of source/dest).
