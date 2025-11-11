import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://127.0.0.1:8000",
});

export const signIn = async () => {
  await authClient.signIn.social({
    provider: "spotify",
    callbackURL: "/",
  });
};
