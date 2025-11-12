import { Copy, GitCompare, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LoginScreenProps {
  onLogin: () => void;
  loading?: boolean;
}

export function LoginScreen({ onLogin, loading = false }: LoginScreenProps) {
  return (
    <div className="flex flex-col items-center gap-12 max-w-5xl w-full px-4">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <GitCompare className="h-16 w-16 text-green-600" />
          <h1 className="text-6xl font-bold">Spotify C&C</h1>
        </div>
        <p className="text-3xl font-semibold text-green-600">
          Compare and Conquer Your Playlists
        </p>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find and remove duplicate tracks across your Spotify playlists with
          ease
        </p>
      </div>

      <Button
        onClick={onLogin}
        disabled={loading}
        size="lg"
        className="bg-green-600 hover:bg-green-700 text-lg h-14 px-12"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Connecting to Spotify...
          </>
        ) : (
          "Login with Spotify"
        )}
      </Button>

      <div className="grid gap-6 md:grid-cols-3 w-full mt-8">
        <Card className="border-2">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="h-12 w-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <GitCompare className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Compare Playlists</h3>
            <p className="text-sm text-muted-foreground">
              Select any two playlists and instantly find duplicate tracks
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Copy className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg">Identify Duplicates</h3>
            <p className="text-sm text-muted-foreground">
              See all duplicate tracks with details like artist and album
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="h-12 w-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg">Clean Up</h3>
            <p className="text-sm text-muted-foreground">
              Choose which playlist to remove duplicates from with one click
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Keep your playlists organized and duplicate-free
        </p>
      </div>
    </div>
  );
}
