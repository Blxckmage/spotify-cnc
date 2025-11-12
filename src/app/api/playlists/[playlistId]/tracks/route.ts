import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SpotifyAPI } from "@/lib/spotify";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playlistId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spotifyAPI = await SpotifyAPI.forUser(session.user.id);

    if (!spotifyAPI) {
      return NextResponse.json(
        { error: "Spotify account not connected" },
        { status: 400 },
      );
    }

    const { playlistId } = await params;
    const tracks = await spotifyAPI.getPlaylistTracks(playlistId, 50, 0);

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist tracks" },
      { status: 500 },
    );
  }
}
