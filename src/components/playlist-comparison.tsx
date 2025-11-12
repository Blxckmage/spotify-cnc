import { ArrowLeft, GitCompare, Music } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpotifyPlaylist } from "@/types/spotify";

interface PlaylistComparisonProps {
  playlists: SpotifyPlaylist[];
  onBack: () => void;
}

export function PlaylistComparison({
  playlists,
  onBack,
}: PlaylistComparisonProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const canCompare =
    selectedLeft && selectedRight && selectedLeft !== selectedRight;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Compare Playlists</h1>
        <div className="w-[100px]" />
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Select Two Playlists</CardTitle>
          <CardDescription>
            Choose playlists from each side to find duplicate tracks
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        <div className="space-y-4">
          <div className="text-center lg:text-left">
            <h2 className="text-xl font-semibold mb-2">First Playlist</h2>
            <p className="text-sm text-muted-foreground">
              {selectedLeft ? "Selected" : "Click to select"}
            </p>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedLeft === playlist.id
                    ? "border-2 border-green-500 bg-green-50 dark:bg-green-950"
                    : selectedRight === playlist.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                }`}
                onClick={() => {
                  if (selectedRight !== playlist.id) {
                    setSelectedLeft(
                      selectedLeft === playlist.id ? null : playlist.id,
                    );
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {playlist.images[0] ? (
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                        {/* biome-ignore lint/performance/noImgElement: External Spotify URLs work fine with img */}
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 bg-muted rounded flex items-center justify-center">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {playlist.tracks.total} tracks
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center lg:pt-24">
          <div className="relative flex flex-col items-center gap-4">
            <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-border -translate-x-1/2" />
            <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4">
              <div className="h-px w-12 bg-border" />
              <div className="h-px w-12 bg-border" />
            </div>
            <Button
              size="lg"
              disabled={!canCompare}
              className="relative z-10 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <GitCompare className="h-5 w-5" />
              Compare
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center lg:text-right">
            <h2 className="text-xl font-semibold mb-2">Second Playlist</h2>
            <p className="text-sm text-muted-foreground">
              {selectedRight ? "Selected" : "Click to select"}
            </p>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pl-2">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedRight === playlist.id
                    ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : selectedLeft === playlist.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                }`}
                onClick={() => {
                  if (selectedLeft !== playlist.id) {
                    setSelectedRight(
                      selectedRight === playlist.id ? null : playlist.id,
                    );
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {playlist.images[0] ? (
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                        {/* biome-ignore lint/performance/noImgElement: External Spotify URLs work fine with img */}
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex-shrink-0 bg-muted rounded flex items-center justify-center">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {playlist.tracks.total} tracks
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
