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
    <div className="w-full max-w-7xl flex items-center justify-between py-2">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Spotify C&C
      </h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
            <AvatarImage src={session.user.image} alt={session.user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {session.user.name}
          </span>
        </div>
        <Button
          onClick={onLogout}
          variant="ghost"
          size="icon"
          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
