"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cachePlaylist,
  clearOldCacheVersions,
  getCachedPlaylist,
  needsRefresh,
} from "@/lib/playlist-cache";
import type { SpotifyPlaylist } from "@/types/spotify";

interface UseCachedPlaylistsResult {
  playlists: SpotifyPlaylist[];
  loading: boolean;
  error: string | null;
  cacheHits: number;
  cacheMisses: number;
  refetch: () => Promise<void>;
}

export function useCachedPlaylists(enabled = true): UseCachedPlaylistsResult {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCacheHits(0);
    setCacheMisses(0);

    try {
      clearOldCacheVersions();

      const response = await fetch("/api/playlists");
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }

      const data = await response.json();
      const fetchedPlaylists: SpotifyPlaylist[] = data.items || [];

      let hits = 0;
      let misses = 0;

      const processedPlaylists = fetchedPlaylists.map((playlist) => {
        const cached = getCachedPlaylist(playlist.id);

        if (cached && !needsRefresh(playlist.id, playlist.snapshot_id)) {
          hits++;
          return { ...playlist, ...(cached.data as object) };
        }

        misses++;
        cachePlaylist(playlist.id, playlist.snapshot_id, playlist);
        return playlist;
      });

      setCacheHits(hits);
      setCacheMisses(misses);
      setPlaylists(processedPlaylists);

      if (hits > 0) {
        console.log(
          `Cache performance: ${hits} hits, ${misses} misses (${Math.round((hits / (hits + misses)) * 100)}% hit rate)`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchPlaylists();
    }
  }, [enabled, fetchPlaylists]);

  return {
    playlists,
    loading,
    error,
    cacheHits,
    cacheMisses,
    refetch: fetchPlaylists,
  };
}
