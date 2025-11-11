import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  title = "Error loading playlists",
  message,
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center max-w-md">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <div>
        <p className="font-semibold text-lg mb-2">{title}</p>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
