"use client";

import { LoginScreen } from "@/components/login-screen";
import { UserProfile } from "@/components/user-profile";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { session, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {session ? (
        <UserProfile session={session} onLogout={logout} />
      ) : (
        <LoginScreen onLogin={login} />
      )}
    </main>
  );
}
