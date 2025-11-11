"use client";

import { Dashboard } from "@/components/dashboard";
import { ErrorDisplay } from "@/components/error-display";
import { LoadingSpinner } from "@/components/loading-spinner";
import { LoginScreen } from "@/components/login-screen";
import { Playlists } from "@/components/playlists";
import { UserProfile } from "@/components/user-profile";
import { useAuth } from "@/hooks/use-auth";
import { useCachedPlaylists } from "@/hooks/use-cached-playlists";

export default function Home() {
  const { session, loading, loggingIn, login, logout } = useAuth();
  const {
    playlists,
    loading: loadingPlaylists,
    error,
    refetch,
  } = useCachedPlaylists(!!session);

  if (loading || loggingIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <LoadingSpinner
          message={loggingIn ? "Connecting to Spotify..." : "Loading..."}
        />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 transition-opacity duration-300 animate-in fade-in">
        <LoginScreen onLogin={login} loading={loggingIn} />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-8 transition-opacity duration-300 animate-in fade-in">
      <UserProfile session={session} onLogout={logout} />

      {loadingPlaylists ? (
        <LoadingSpinner message="Loading playlists..." />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={refetch} />
      ) : (
        <>
          <Dashboard playlists={playlists} />
          <Playlists playlists={playlists} />
        </>
      )}
    </main>
  );
}
