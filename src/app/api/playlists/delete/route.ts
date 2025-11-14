import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SpotifyAPI } from "@/lib/spotify";

interface DeleteRequest {
  leftPlaylistId?: string;
  rightPlaylistId?: string;
  trackUris: string[];
  deleteFrom: "left" | "right" | "both";
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as DeleteRequest;
    const { leftPlaylistId, rightPlaylistId, trackUris, deleteFrom } = body;

    if (!trackUris || trackUris.length === 0) {
      return NextResponse.json(
        { error: "No tracks specified" },
        { status: 400 },
      );
    }

    if (deleteFrom === "left" && !leftPlaylistId) {
      return NextResponse.json(
        { error: "Left playlist ID required" },
        { status: 400 },
      );
    }

    if (deleteFrom === "right" && !rightPlaylistId) {
      return NextResponse.json(
        { error: "Right playlist ID required" },
        { status: 400 },
      );
    }

    if (deleteFrom === "both" && (!leftPlaylistId || !rightPlaylistId)) {
      return NextResponse.json(
        { error: "Both playlist IDs required" },
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

    const results: {
      left?: { snapshot_id: string };
      right?: { snapshot_id: string };
    } = {};

    if (deleteFrom === "left" || deleteFrom === "both") {
      if (leftPlaylistId) {
        results.left = await spotify.removeTracksFromPlaylist(
          leftPlaylistId,
          trackUris,
        );
      }
    }

    if (deleteFrom === "right" || deleteFrom === "both") {
      if (rightPlaylistId) {
        results.right = await spotify.removeTracksFromPlaylist(
          rightPlaylistId,
          trackUris,
        );
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: trackUris.length,
      results,
    });
  } catch (error) {
    console.error("Error deleting tracks:", error);
    return NextResponse.json(
      { error: "Failed to delete tracks" },
      { status: 500 },
    );
  }
}
