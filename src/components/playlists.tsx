import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpotifyPlaylist } from "@/lib/spotify";
import { ExternalLink, Music } from "lucide-react";

interface PlaylistsProps {
  playlists: SpotifyPlaylist[];
}

export function Playlists({ playlists }: PlaylistsProps) {
  if (playlists.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No playlists found. Create some playlists on Spotify!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-2xl font-bold mb-6">Your Playlists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <a
            key={playlist.id}
            href={playlist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="p-0">
                {playlist.images[0] ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-2">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-square w-full bg-muted flex items-center justify-center rounded-t-xl">
                    <Music className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="line-clamp-1 text-lg mb-2">
                  {playlist.name}
                </CardTitle>
                {playlist.description && (
                  <CardDescription className="line-clamp-2 mb-3">
                    {playlist.description}
                  </CardDescription>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">
                    {playlist.tracks.total} tracks
                  </span>
                  <Badge variant={playlist.public ? "default" : "secondary"}>
                    {playlist.public ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
