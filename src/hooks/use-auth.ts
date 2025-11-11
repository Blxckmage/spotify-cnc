import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    token: string;
    expiresAt: Date;
  };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authClient.getSession();
        setSession(data.data as Session | null);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    setLoggingIn(true);
    try {
      await authClient.signIn.social({
        provider: "spotify",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Login failed:", error);
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await authClient.signOut();
    setSession(null);
  };

  return {
    session,
    loading,
    loggingIn,
    isAuthenticated: !!session,
    login,
    logout,
  };
}
