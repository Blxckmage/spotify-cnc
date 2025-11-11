/**
 * Smart caching for Spotify playlists using snapshot IDs
 * Dramatically reduces API calls by only re-fetching changed playlists
 */

const CACHE_VERSION = "v1";
const CACHE_KEY_PREFIX = "spotify_playlist_cache";

export interface CachedPlaylist {
  snapshot_id: string;
  data: unknown;
  cached_at: number;
}

/**
 * Check if a playlist needs to be re-fetched based on snapshot_id
 */
export function needsRefresh(
  playlistId: string,
  currentSnapshotId: string,
): boolean {
  try {
    const cached = getCachedPlaylist(playlistId);
    if (!cached) return true;

    // If snapshot_id matches, playlist hasn't changed
    return cached.snapshot_id !== currentSnapshotId;
  } catch {
    return true;
  }
}

/**
 * Get cached playlist data
 */
export function getCachedPlaylist(playlistId: string): CachedPlaylist | null {
  try {
    if (typeof window === "undefined") return null;

    const key = `${CACHE_KEY_PREFIX}_${CACHE_VERSION}_${playlistId}`;
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    return JSON.parse(cached) as CachedPlaylist;
  } catch {
    return null;
  }
}

/**
 * Cache playlist data with snapshot_id
 */
export function cachePlaylist(
  playlistId: string,
  snapshotId: string,
  data: unknown,
): void {
  try {
    if (typeof window === "undefined") return;

    const key = `${CACHE_KEY_PREFIX}_${CACHE_VERSION}_${playlistId}`;
    const cached: CachedPlaylist = {
      snapshot_id: snapshotId,
      data,
      cached_at: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(cached));
  } catch (error) {
    // Silently fail if localStorage is full or unavailable
    console.warn("Failed to cache playlist:", error);
  }
}

/**
 * Clear all cached playlists (useful for logout or cache invalidation)
 */
export function clearPlaylistCache(): void {
  try {
    if (typeof window === "undefined") return;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(`${CACHE_KEY_PREFIX}_${CACHE_VERSION}_`)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn("Failed to clear playlist cache:", error);
  }
}

/**
 * Clear old cache versions (useful for migrations)
 */
export function clearOldCacheVersions(): void {
  try {
    if (typeof window === "undefined") return;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (
        key.startsWith(CACHE_KEY_PREFIX) &&
        !key.startsWith(`${CACHE_KEY_PREFIX}_${CACHE_VERSION}_`)
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn("Failed to clear old cache versions:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  total: number;
  size_kb: number;
} {
  try {
    if (typeof window === "undefined") return { total: 0, size_kb: 0 };

    let total = 0;
    let totalSize = 0;

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(`${CACHE_KEY_PREFIX}_${CACHE_VERSION}_`)) {
        total++;
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }
    }

    return {
      total,
      size_kb: Math.round(totalSize / 1024),
    };
  } catch {
    return { total: 0, size_kb: 0 };
  }
}
