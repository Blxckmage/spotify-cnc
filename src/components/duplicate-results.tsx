import {
  CheckSquare,
  Disc3,
  FileCode,
  Filter,
  Guitar,
  Mic2,
  Music,
  Play,
  Radio,
  Square,
  Timer,
  Trash2,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { SpotifyPlaylistTrack } from "@/types/spotify";

type VariationType =
  | "live"
  | "remix"
  | "remaster"
  | "acoustic"
  | "instrumental"
  | "radio_edit"
  | "extended"
  | "demo"
  | "other"
  | null;

interface DuplicateTrack {
  track: SpotifyPlaylistTrack["track"];
  inLeft: boolean;
  inRight: boolean;
  matchType: "exact" | "similar";
  variationType: VariationType;
}

interface DuplicateResultsProps {
  duplicates: DuplicateTrack[];
  stats: {
    leftTotal: number;
    rightTotal: number;
    duplicatesFound: number;
  };
  leftPlaylistName: string;
  rightPlaylistName: string;
  onClose: () => void;
  onDelete: (
    trackUris: string[],
    deleteFrom: "left" | "right" | "both",
  ) => void;
}

const variationTypeLabels: Record<NonNullable<VariationType>, string> = {
  live: "Live",
  remix: "Remix",
  remaster: "Remaster",
  acoustic: "Acoustic",
  instrumental: "Instrumental",
  radio_edit: "Radio Edit",
  extended: "Extended",
  demo: "Demo",
  other: "Other",
};

const variationTypeIcons: Record<
  NonNullable<VariationType>,
  React.ElementType
> = {
  live: Mic2,
  remix: Disc3,
  remaster: Timer,
  acoustic: Guitar,
  instrumental: Volume2,
  radio_edit: Radio,
  extended: Play,
  demo: FileCode,
  other: Music,
};

export function DuplicateResults({
  duplicates,
  stats,
  leftPlaylistName,
  rightPlaylistName,
  onClose,
  onDelete,
}: DuplicateResultsProps) {
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [deleteFrom, setDeleteFrom] = useState<"left" | "right" | "both">(
    "both",
  );

  const variationGroups = useMemo(() => {
    const groups = new Map<VariationType, DuplicateTrack[]>();

    for (const dup of duplicates) {
      const existing = groups.get(dup.variationType) || [];
      existing.push(dup);
      groups.set(dup.variationType, existing);
    }

    return groups;
  }, [duplicates]);

  const handleSelectTrack = useCallback((uri: string) => {
    setSelectedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(uri)) {
        next.delete(uri);
      } else {
        next.add(uri);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedTracks.size === duplicates.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(duplicates.map((d) => d.track.uri)));
    }
  }, [duplicates, selectedTracks]);

  const handleSelectByVariation = useCallback(
    (variationType: VariationType) => {
      const tracksOfType = variationGroups.get(variationType) || [];
      const urisOfType = tracksOfType.map((t) => t.track.uri);

      setSelectedTracks((prev) => {
        const next = new Set(prev);
        const allSelected = urisOfType.every((uri) => next.has(uri));

        if (allSelected) {
          for (const uri of urisOfType) {
            next.delete(uri);
          }
        } else {
          for (const uri of urisOfType) {
            next.add(uri);
          }
        }

        return next;
      });
    },
    [variationGroups],
  );

  const handleDelete = useCallback(() => {
    if (selectedTracks.size === 0) return;
    onDelete(Array.from(selectedTracks), deleteFrom);
  }, [selectedTracks, deleteFrom, onDelete]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const allSelected =
    selectedTracks.size === duplicates.length && duplicates.length > 0;

  return (
    <div className="w-full max-w-7xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Duplicate Tracks Found</CardTitle>
              <CardDescription className="mt-2">
                Found {stats.duplicatesFound} duplicate track
                {stats.duplicatesFound === 1 ? "" : "s"} between{" "}
                <span className="font-medium text-foreground">
                  {leftPlaylistName}
                </span>{" "}
                and{" "}
                <span className="font-medium text-foreground">
                  {rightPlaylistName}
                </span>
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Back to Selection
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                <Filter className="inline h-4 w-4 mr-2" />
                Quick Filters
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {allSelected ? (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Select All ({duplicates.length})
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from(variationGroups.entries())
                .filter(([type]) => type !== null)
                .map(([type, tracks]) => {
                  const allOfTypeSelected = tracks.every((t) =>
                    selectedTracks.has(t.track.uri),
                  );
                  const Icon =
                    variationTypeIcons[type as NonNullable<VariationType>];

                  return (
                    <Button
                      key={type}
                      variant={allOfTypeSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectByVariation(type)}
                      className="text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {variationTypeLabels[type as NonNullable<VariationType>]}{" "}
                      ({tracks.length})
                    </Button>
                  );
                })}
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardContent className="pt-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {duplicates.map((dup) => {
                const isSelected = selectedTracks.has(dup.track.uri);
                const Icon = dup.variationType
                  ? variationTypeIcons[dup.variationType]
                  : null;

                return (
                  <div
                    key={dup.track.uri}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectTrack(dup.track.uri)}
                      className="mt-1"
                    />

                    {dup.track.album.images[0]?.url ? (
                      <Image
                        src={dup.track.album.images[0].url}
                        alt={dup.track.album.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {dup.track.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {dup.track.artists.map((a) => a.name).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dup.track.album.name} •{" "}
                        {formatDuration(dup.track.duration_ms)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            dup.matchType === "exact" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {dup.matchType === "exact"
                            ? "Exact Match"
                            : "Similar"}
                        </Badge>
                        {dup.variationType && Icon && (
                          <Badge variant="outline" className="text-xs">
                            <Icon className="h-3 w-3 mr-1" />
                            {variationTypeLabels[dup.variationType]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>

        <Separator />

        <CardFooter className="flex-col items-stretch gap-4 pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedTracks.size} track{selectedTracks.size === 1 ? "" : "s"}{" "}
              selected
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Delete from:
              </span>
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={deleteFrom === "left" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeleteFrom("left")}
                  className="text-xs h-8"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  Left
                </Button>
                <Button
                  variant={deleteFrom === "both" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeleteFrom("both")}
                  className="text-xs h-8"
                >
                  Both
                </Button>
                <Button
                  variant={deleteFrom === "right" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeleteFrom("right")}
                  className="text-xs h-8"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
                  Right
                </Button>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            disabled={selectedTracks.size === 0}
            onClick={handleDelete}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove {selectedTracks.size > 0 ? selectedTracks.size : ""} Track
            {selectedTracks.size === 1 ? "" : "s"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
