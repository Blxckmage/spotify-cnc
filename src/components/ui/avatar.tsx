import * as React from "react";
import { cn } from "@/lib/utils";

type AvatarContextValue = {
  imageLoadingStatus: "idle" | "loading" | "loaded" | "error";
  setImageLoadingStatus: (
    status: "idle" | "loading" | "loaded" | "error",
  ) => void;
};

const AvatarContext = React.createContext<AvatarContextValue | undefined>(
  undefined,
);

const useAvatarContext = () => {
  const context = React.useContext(AvatarContext);
  if (!context) {
    throw new Error("Avatar components must be used within an Avatar");
  }
  return context;
};

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [imageLoadingStatus, setImageLoadingStatus] = React.useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  return (
    <AvatarContext.Provider
      value={{ imageLoadingStatus, setImageLoadingStatus }}
    >
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, ...props }, ref) => {
  const { imageLoadingStatus, setImageLoadingStatus } = useAvatarContext();

  React.useEffect(() => {
    if (!src || typeof src !== "string") {
      setImageLoadingStatus("error");
      return;
    }

    setImageLoadingStatus("loading");

    const img = new Image();
    img.src = src;
    img.onload = () => setImageLoadingStatus("loaded");
    img.onerror = () => setImageLoadingStatus("error");

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, setImageLoadingStatus]);

  return imageLoadingStatus === "loaded" ? (
    <img
      ref={ref}
      src={src}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  ) : null;
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { imageLoadingStatus } = useAvatarContext();

  return imageLoadingStatus !== "loaded" ? (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className,
      )}
      {...props}
    />
  ) : null;
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
