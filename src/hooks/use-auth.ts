import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

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
    await authClient.signIn.social({
      provider: "spotify",
      callbackURL: "/",
    });
  };

  const logout = async () => {
    await authClient.signOut();
    setSession(null);
  };

  return {
    session,
    loading,
    isAuthenticated: !!session,
    login,
    logout,
  };
}
