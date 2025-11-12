import { GitCompare } from "lucide-react";
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
    <div className="w-full max-w-7xl space-y-8">
      <Card className="border-2 border-green-200 dark:border-green-900">
        <CardHeader>
          <div className="flex items-center justify-between">
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
        <CardContent>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <span>{totalPlaylists} playlists available</span>
            <span>•</span>
            <span>{totalTracks} total tracks</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
