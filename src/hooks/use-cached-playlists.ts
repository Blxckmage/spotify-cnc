"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cachePlaylist,
  clearOldCacheVersions,
  getCachedPlaylist,
  needsRefresh,
} from "@/lib/playlist-cache";
import type { SpotifyPlaylist } from "@/lib/spotify";

interface UseCachedPlaylistsResult {
  playlists: SpotifyPlaylist[];
  loading: boolean;
  error: string | null;
  cacheHits: number;
  cacheMisses: number;
  refetch: () => Promise<void>;
}

/**
 * Hook that fetches playlists with smart caching
 * Uses snapshot_id to avoid re-fetching unchanged playlists
 */
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
      // Clear old cache versions on mount
      clearOldCacheVersions();

      // Fetch playlist list from API
      const response = await fetch("/api/playlists");
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }

      const data = await response.json();
      const fetchedPlaylists: SpotifyPlaylist[] = data.items || [];

      let hits = 0;
      let misses = 0;

      // Check cache for each playlist
      const processedPlaylists = fetchedPlaylists.map((playlist) => {
        const cached = getCachedPlaylist(playlist.id);

        // Check if we need to refresh based on snapshot_id
        if (cached && !needsRefresh(playlist.id, playlist.snapshot_id)) {
          hits++;
          // Return cached version (could include more detailed data)
          return { ...playlist, ...(cached.data as object) };
        }

        misses++;
        // Cache the new/updated playlist
        cachePlaylist(playlist.id, playlist.snapshot_id, playlist);
        return playlist;
      });

      setCacheHits(hits);
      setCacheMisses(misses);
      setPlaylists(processedPlaylists);

      // Log cache performance
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
