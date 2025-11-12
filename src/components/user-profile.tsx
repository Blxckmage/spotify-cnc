import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
    <div className="w-full max-w-7xl flex items-center justify-between">
      <h1 className="text-3xl font-bold">Spotify C&C</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image} alt={session.user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{session.user.name}</span>
        </div>
        <Button onClick={onLogout} variant="ghost" size="icon">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
