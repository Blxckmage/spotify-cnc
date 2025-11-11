import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListMusic, Loader2, Music, TrendingUp } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
  loading?: boolean;
}

export function LoginScreen({ onLogin, loading = false }: LoginScreenProps) {
  return (
    <div className="flex flex-col items-center gap-12 max-w-4xl w-full px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">Spotify C&C</h1>
        <p className="text-2xl text-muted-foreground">Compare and Conquer</p>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Manage and analyze your Spotify playlists with powerful insights
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
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <ListMusic className="h-10 w-10 mx-auto text-primary" />
            <h3 className="font-semibold text-lg">Track Playlists</h3>
            <p className="text-sm text-muted-foreground">
              View all your playlists in one place
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <Music className="h-10 w-10 mx-auto text-primary" />
            <h3 className="font-semibold text-lg">Analyze Stats</h3>
            <p className="text-sm text-muted-foreground">
              Get insights on tracks and collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <TrendingUp className="h-10 w-10 mx-auto text-primary" />
            <h3 className="font-semibold text-lg">Compare & Conquer</h3>
            <p className="text-sm text-muted-foreground">
              Compare playlists and discover patterns
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
