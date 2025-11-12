import { Check, GitCompare, Music, Search, X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { SpotifyPlaylist } from "@/types/spotify";

interface PlaylistComparisonProps {
  playlists: SpotifyPlaylist[];
}

export function PlaylistComparison({ playlists }: PlaylistComparisonProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [searchLeft, setSearchLeft] = useState("");
  const [searchRight, setSearchRight] = useState("");

  const canCompare =
    selectedLeft && selectedRight && selectedLeft !== selectedRight;

  const selectedLeftPlaylist = useMemo(
    () => playlists.find((p) => p.id === selectedLeft),
    [playlists, selectedLeft],
  );

  const selectedRightPlaylist = useMemo(
    () => playlists.find((p) => p.id === selectedRight),
    [playlists, selectedRight],
  );

  const filteredLeftPlaylists = useMemo(
    () =>
      playlists.filter((p) =>
        p.name.toLowerCase().includes(searchLeft.toLowerCase()),
      ),
    [playlists, searchLeft],
  );

  const filteredRightPlaylists = useMemo(
    () =>
      playlists.filter((p) =>
        p.name.toLowerCase().includes(searchRight.toLowerCase()),
      ),
    [playlists, searchRight],
  );

  const handleLeftSelect = useCallback(
    (id: string) => {
      setSelectedLeft(selectedLeft === id ? null : id);
    },
    [selectedLeft],
  );

  const handleRightSelect = useCallback(
    (id: string) => {
      setSelectedRight(selectedRight === id ? null : id);
    },
    [selectedRight],
  );

  return (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex items-center justify-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-green-500/20 rounded-lg blur-md group-hover:bg-green-500/30 transition duration-300" />
          <div className="relative bg-green-600 dark:bg-green-500 p-2.5 rounded-lg border border-green-500/20 shadow-sm hover:shadow-md hover:border-green-400/40 transition-all duration-300">
            <GitCompare className="h-6 w-6 text-white" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Compare Playlists
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[1fr_auto_1fr]">
        <Card className="order-1">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">First Playlist</CardTitle>
                  <CardDescription className="mt-1">
                    {selectedLeftPlaylist
                      ? `${selectedLeftPlaylist.tracks.total.toLocaleString()} tracks`
                      : "Select a playlist"}
                  </CardDescription>
                </div>
                {selectedLeft && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedLeft(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Separator />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search playlists..."
                  value={searchLeft}
                  onChange={(e) => setSearchLeft(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {filteredLeftPlaylists.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No playlists found</p>
                  </div>
                ) : (
                  filteredLeftPlaylists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      isSelected={selectedLeft === playlist.id}
                      isDisabled={selectedRight === playlist.id}
                      onSelect={() => handleLeftSelect(playlist.id)}
                      color="green"
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex lg:hidden flex-col items-center justify-center gap-4 py-6 order-2">
          <div
            className={`relative flex flex-col items-center gap-3 py-4 px-6 rounded-xl border-2 shadow-lg transition-all duration-300 ${
              canCompare
                ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-500/30"
                : "bg-muted/30 border-muted"
            }`}
          >
            {canCompare && (
              <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl opacity-20 blur-xl" />
            )}
            <div className="relative flex items-center gap-2">
              {canCompare ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
                    Ready
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Playlists
                </span>
              )}
            </div>
            <Button
              size="lg"
              disabled={!canCompare}
              className="relative bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <GitCompare className="h-4 w-4" />
              Find Duplicates
            </Button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground max-w-[200px] line-clamp-1">
                {selectedLeftPlaylist?.name || "—"}
              </p>
              <p
                className={`text-xs font-medium transition-colors duration-200 ${
                  canCompare
                    ? "text-green-600 dark:text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                vs
              </p>
              <p className="text-xs text-muted-foreground max-w-[200px] line-clamp-1">
                {selectedRightPlaylist?.name || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center gap-6 pt-32 order-2">
          <div className="relative flex flex-col items-center">
            <div
              className={`h-px w-24 transition-opacity duration-300 ${
                selectedLeft
                  ? "bg-gradient-to-r from-green-500 to-transparent opacity-100"
                  : "bg-gradient-to-r from-muted to-transparent opacity-30"
              }`}
            />
            <div
              className={`absolute -left-24 top-0 h-px w-24 transition-opacity duration-300 ${
                selectedLeft
                  ? "bg-gradient-to-l from-green-500 to-transparent opacity-100"
                  : "bg-gradient-to-l from-muted to-transparent opacity-30"
              }`}
            />
          </div>

          <div
            className={`relative flex flex-col items-center gap-3 py-4 px-6 rounded-xl border-2 shadow-lg transition-all duration-300 ${
              canCompare
                ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-500/30"
                : "bg-muted/30 border-muted"
            }`}
          >
            {canCompare && (
              <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl opacity-20 blur-xl" />
            )}
            <div className="relative flex items-center gap-2">
              {canCompare ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
                    Ready
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Playlists
                </span>
              )}
            </div>
            <Button
              size="lg"
              disabled={!canCompare}
              className="relative bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <GitCompare className="h-4 w-4" />
              Find Duplicates
            </Button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground max-w-[200px] line-clamp-1">
                {selectedLeftPlaylist?.name || "—"}
              </p>
              <p
                className={`text-xs font-medium transition-colors duration-200 ${
                  canCompare
                    ? "text-green-600 dark:text-green-500"
                    : "text-muted-foreground"
                }`}
              >
                vs
              </p>
              <p className="text-xs text-muted-foreground max-w-[200px] line-clamp-1">
                {selectedRightPlaylist?.name || "—"}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            <div
              className={`h-px w-24 transition-opacity duration-300 ${
                selectedRight
                  ? "bg-gradient-to-l from-blue-500 to-transparent opacity-100"
                  : "bg-gradient-to-l from-muted to-transparent opacity-30"
              }`}
            />
            <div
              className={`absolute -right-24 top-0 h-px w-24 transition-opacity duration-300 ${
                selectedRight
                  ? "bg-gradient-to-r from-blue-500 to-transparent opacity-100"
                  : "bg-gradient-to-r from-muted to-transparent opacity-30"
              }`}
            />
          </div>
        </div>

        <Card className="order-3">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Second Playlist</CardTitle>
                  <CardDescription className="mt-1">
                    {selectedRightPlaylist
                      ? `${selectedRightPlaylist.tracks.total.toLocaleString()} tracks`
                      : "Select a playlist"}
                  </CardDescription>
                </div>
                {selectedRight && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedRight(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Separator />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search playlists..."
                  value={searchRight}
                  onChange={(e) => setSearchRight(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {filteredRightPlaylists.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No playlists found</p>
                  </div>
                ) : (
                  filteredRightPlaylists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      isSelected={selectedRight === playlist.id}
                      isDisabled={selectedLeft === playlist.id}
                      onSelect={() => handleRightSelect(playlist.id)}
                      color="blue"
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  color: "green" | "blue";
}

const PlaylistCard = memo(
  ({
    playlist,
    isSelected,
    isDisabled,
    onSelect,
    color,
  }: PlaylistCardProps) => {
    const colorClasses = {
      green: {
        border: "border-green-500",
        bg: "bg-green-50",
        ring: "ring-green-500",
      },
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-50",
        ring: "ring-blue-500",
      },
    };

    const colors = colorClasses[color];

    return (
      <button
        type="button"
        onClick={onSelect}
        disabled={isDisabled}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all relative ${
          isSelected
            ? `${colors.border} ${colors.bg} ring-2 ${colors.ring} ring-offset-2`
            : "border-border hover:border-muted-foreground"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        )}
        <div className="flex items-start gap-3">
          {playlist.images[0]?.url ? (
            <Image
              src={playlist.images[0].url}
              alt={playlist.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{playlist.name}</p>
            <p className="text-xs text-muted-foreground">
              {playlist.tracks.total.toLocaleString()} tracks
            </p>
          </div>
        </div>
      </button>
    );
  },
);

PlaylistCard.displayName = "PlaylistCard";
