import { GitCompare, ListMusic, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpotifyPlaylist } from "@/types/spotify";

interface DashboardProps {
  playlists: SpotifyPlaylist[];
  onCompareClick?: () => void;
}

export function Dashboard({ playlists, onCompareClick }: DashboardProps) {
  const totalPlaylists = playlists.length;
  const totalTracks = playlists.reduce(
    (sum, playlist) => sum + (playlist.tracks.total || 0),
    0,
  );

  return (
    <div className="w-full max-w-6xl space-y-8">
      <Card className="border-2 border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <GitCompare className="h-6 w-6 text-green-600" />
                Compare Your Playlists
              </CardTitle>
              <CardDescription className="text-base">
                Find and remove duplicate tracks between any two playlists
              </CardDescription>
            </div>
            <Button
              onClick={onCompareClick}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <GitCompare className="h-4 w-4" />
              Start Comparing
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Playlists
            </CardTitle>
            <ListMusic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlaylists}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for comparison
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTracks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all playlists
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
