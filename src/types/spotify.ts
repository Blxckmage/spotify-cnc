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

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  artists: {
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }[];
  album: {
    id: string;
    name: string;
    images: { url: string }[];
  };
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  track: SpotifyTrack;
}

export interface SpotifyPlaylistTracksResponse {
  items: SpotifyPlaylistTrack[];
  total: number;
  limit: number;
  offset: number;
}
