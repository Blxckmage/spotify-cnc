"use client";

import { LoginScreen } from "@/components/login-screen";
import { Playlists } from "@/components/playlists";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/user-profile";
import { useAuth } from "@/hooks/use-auth";
import type { SpotifyPlaylist } from "@/lib/spotify";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { session, loading, login, logout } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchPlaylists();
    }
  }, [session]);

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    setError(null);
    try {
      const response = await fetch("/api/playlists");
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }
      const data = await response.json();
      setPlaylists(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load playlists");
    } finally {
      setLoadingPlaylists(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <LoginScreen onLogin={login} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-8">
      <UserProfile session={session} onLogout={logout} />

      {loadingPlaylists ? (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading playlists...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <div>
            <p className="font-semibold text-lg mb-2">
              Error loading playlists
            </p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
          </div>
          <Button onClick={fetchPlaylists} variant="outline">
            Try Again
          </Button>
        </div>
      ) : (
        <Playlists playlists={playlists} />
      )}
    </main>
  );
}
