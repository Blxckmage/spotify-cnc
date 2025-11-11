import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Session } from "@/hooks/use-auth";

interface UserProfileProps {
  session: Session;
  onLogout: () => void;
}

export function UserProfile({ session, onLogout }: UserProfileProps) {
  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
      <h1 className="text-4xl font-bold">Spotify C&C</h1>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session.user.image} alt={session.user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{session.user.name}</h2>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">User ID:</span>{" "}
              {session.user.id}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                Email Verified:
              </span>{" "}
              {session.user.emailVerified ? "Yes" : "No"}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                Account Created:
              </span>{" "}
              {new Date(session.user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button onClick={onLogout} variant="destructive" className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
