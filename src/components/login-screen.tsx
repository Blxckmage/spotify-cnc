import { Button } from "@/components/ui/button";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-4xl font-bold">Spotify C&C</h1>
      <p className="text-xl text-muted-foreground">Compare and Conquer</p>
      <Button
        onClick={onLogin}
        size="lg"
        className="bg-green-600 hover:bg-green-700"
      >
        Login with Spotify
      </Button>
    </div>
  );
}
