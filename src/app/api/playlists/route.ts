import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SpotifyAPI } from "@/lib/spotify";

export async function GET() {
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

    const playlists = await spotifyAPI.getUserPlaylists();

    return NextResponse.json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 },
    );
  }
}
