import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SpotifyAPI } from "@/lib/spotify";
import type { SpotifyPlaylistTrack } from "@/types/spotify";

type VariationType =
  | "live"
  | "remix"
  | "remaster"
  | "acoustic"
  | "instrumental"
  | "radio_edit"
  | "extended"
  | "demo"
  | "other"
  | null;

interface DuplicateTrack {
  track: SpotifyPlaylistTrack["track"];
  inLeft: boolean;
  inRight: boolean;
  matchType: "exact" | "similar";
  variationType: VariationType;
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leftId = searchParams.get("leftId");
    const rightId = searchParams.get("rightId");

    if (!leftId || !rightId) {
      return NextResponse.json(
        { error: "Missing playlist IDs" },
        { status: 400 },
      );
    }

    if (leftId === rightId) {
      return NextResponse.json(
        { error: "Cannot compare a playlist with itself" },
        { status: 400 },
      );
    }

    const spotify = await SpotifyAPI.forUser(session.user.id);

    if (!spotify) {
      return NextResponse.json(
        { error: "Failed to initialize Spotify client" },
        { status: 500 },
      );
    }

    const [leftTracks, rightTracks] = await Promise.all([
      spotify.getPlaylistTracks(leftId),
      spotify.getPlaylistTracks(rightId),
    ]);

    const duplicates = findDuplicates(leftTracks.items, rightTracks.items);

    return NextResponse.json({
      duplicates,
      stats: {
        leftTotal: leftTracks.total,
        rightTotal: rightTracks.total,
        duplicatesFound: duplicates.length,
      },
    });
  } catch (error) {
    console.error("Error comparing playlists:", error);
    return NextResponse.json(
      { error: "Failed to compare playlists" },
      { status: 500 },
    );
  }
}

// NOTE: O(n + m) time complexity - builds maps for O(1) lookup
function findDuplicates(
  leftTracks: SpotifyPlaylistTrack[],
  rightTracks: SpotifyPlaylistTrack[],
): DuplicateTrack[] {
  const duplicates: DuplicateTrack[] = [];

  const leftByUri = new Map<string, SpotifyPlaylistTrack["track"]>();
  const leftBySignature = new Map<string, SpotifyPlaylistTrack["track"]>();

  for (const item of leftTracks) {
    if (!item.track) continue;

    leftByUri.set(item.track.uri, item.track);

    const signature = normalizeTrackSignature(item.track);
    if (!leftBySignature.has(signature)) {
      leftBySignature.set(signature, item.track);
    }
  }

  const seenUris = new Set<string>();

  for (const item of rightTracks) {
    if (!item.track) continue;

    const uri = item.track.uri;

    if (seenUris.has(uri)) continue;

    if (leftByUri.has(uri)) {
      duplicates.push({
        track: item.track,
        inLeft: true,
        inRight: true,
        matchType: "exact",
        variationType: null,
      });
      seenUris.add(uri);
      continue;
    }

    const signature = normalizeTrackSignature(item.track);
    const similarTrack = leftBySignature.get(signature);

    if (similarTrack && similarTrack.uri !== uri) {
      duplicates.push({
        track: item.track,
        inLeft: true,
        inRight: true,
        matchType: "similar",
        variationType: detectVariationType(item.track.name),
      });
      seenUris.add(uri);
    }
  }

  return duplicates;
}

function normalizeTrackSignature(track: SpotifyPlaylistTrack["track"]): string {
  const trackName = track.name.toLowerCase().trim();
  const primaryArtist =
    track.artists[0]?.name.toLowerCase().trim() || "unknown";

  const cleanName = trackName
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/\s*\[.*?\]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `${cleanName}|${primaryArtist}`;
}

function detectVariationType(trackName: string): VariationType {
  const lowerName = trackName.toLowerCase();

  if (/\b(live|en vivo|ao vivo)\b/i.test(lowerName)) return "live";
  if (/\b(remix|rmx|rework|edit)\b/i.test(lowerName)) return "remix";
  if (/\b(remaster|remastered)\b/i.test(lowerName)) return "remaster";
  if (/\b(acoustic|unplugged|stripped)\b/i.test(lowerName)) return "acoustic";
  if (/\b(instrumental|karaoke)\b/i.test(lowerName)) return "instrumental";
  if (/\b(radio edit|single version)\b/i.test(lowerName)) return "radio_edit";
  if (/\b(extended|long version|full length)\b/i.test(lowerName))
    return "extended";
  if (/\b(demo|rough mix)\b/i.test(lowerName)) return "demo";

  if (/[([].*?[)\]]/.test(trackName)) return "other";

  return null;
}
