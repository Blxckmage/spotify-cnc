import { prisma } from "./prisma";
import { spotifyFetch } from "./spotify-fetch";

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: { url: string }[];
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
  };
  public: boolean;
  external_urls: {
    spotify: string;
  };
  snapshot_id: string;
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
}

export class SpotifyAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static async forUser(userId: string): Promise<SpotifyAPI | null> {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "spotify",
      },
    });

    if (!account?.accessToken) {
      return null;
    }

    // Check if token is expired and refresh if needed
    if (
      account.accessTokenExpiresAt &&
      new Date(account.accessTokenExpiresAt) < new Date()
    ) {
      if (!account.refreshToken) {
        return null;
      }
      const newToken = await SpotifyAPI.refreshAccessToken(
        account.refreshToken,
      );
      if (newToken) {
        await prisma.account.update({
          where: { id: account.id },
          data: {
            accessToken: newToken.access_token,
            accessTokenExpiresAt: new Date(
              Date.now() + newToken.expires_in * 1000,
            ),
          },
        });
        return new SpotifyAPI(newToken.access_token);
      }
    }

    return new SpotifyAPI(account.accessToken);
  }

  private static async refreshAccessToken(refreshToken: string) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  async getUserPlaylists(
    limit = 50,
    offset = 0,
  ): Promise<SpotifyPlaylistsResponse> {
    const response = await spotifyFetch(
      `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    return response.json();
  }

  async getCurrentUser() {
    const response = await spotifyFetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return response.json();
  }
}
