/**
 * Manual Test Suite for Duplicate Finder Algorithm
 * Run with: npx tsx src/lib/duplicate-finder.test.ts
 */

import type { SpotifyPlaylistTrack } from "@/types/spotify";

interface DuplicateTrack {
  track: SpotifyPlaylistTrack["track"];
  inLeft: boolean;
  inRight: boolean;
  matchType: "exact" | "similar";
}

export function findDuplicates(
  leftTracks: SpotifyPlaylistTrack[],
  rightTracks: SpotifyPlaylistTrack[],
): DuplicateTrack[] {
  const duplicates: DuplicateTrack[] = [];

  // Build maps from left playlist for O(1) lookup
  const leftByUri = new Map<string, SpotifyPlaylistTrack["track"]>();
  const leftBySignature = new Map<string, SpotifyPlaylistTrack["track"]>();

  for (const item of leftTracks) {
    if (!item.track) continue;

    // Map by exact URI
    leftByUri.set(item.track.uri, item.track);

    // Map by normalized signature (lowercase name + primary artist)
    const signature = normalizeTrackSignature(item.track);
    if (!leftBySignature.has(signature)) {
      leftBySignature.set(signature, item.track);
    }
  }

  // Check right playlist tracks for duplicates
  const seenUris = new Set<string>();

  for (const item of rightTracks) {
    if (!item.track) continue;

    const uri = item.track.uri;

    // Skip if already processed
    if (seenUris.has(uri)) continue;

    // Check for exact URI match first (fastest, most accurate)
    if (leftByUri.has(uri)) {
      duplicates.push({
        track: item.track,
        inLeft: true,
        inRight: true,
        matchType: "exact",
      });
      seenUris.add(uri);
      continue;
    }

    // Check for similar track (name + artist match)
    const signature = normalizeTrackSignature(item.track);
    const similarTrack = leftBySignature.get(signature);

    if (similarTrack && similarTrack.uri !== uri) {
      duplicates.push({
        track: item.track,
        inLeft: true,
        inRight: true,
        matchType: "similar",
      });
      seenUris.add(uri);
    }
  }

  return duplicates;
}

export function normalizeTrackSignature(
  track: SpotifyPlaylistTrack["track"],
): string {
  const trackName = track.name.toLowerCase().trim();
  const primaryArtist =
    track.artists[0]?.name.toLowerCase().trim() || "unknown";

  // Remove common variations that might cause false negatives
  const cleanName = trackName
    .replace(/\s*\(.*?\)\s*/g, "") // Remove parentheses content
    .replace(/\s*\[.*?\]\s*/g, "") // Remove bracket content
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  return `${cleanName}|${primaryArtist}`;
}

// Helper to create mock track
function createMockTrack(
  id: string,
  name: string,
  artist: string,
  uri?: string,
): SpotifyPlaylistTrack {
  return {
    added_at: "2024-01-01T00:00:00Z",
    track: {
      id,
      name,
      uri: uri || `spotify:track:${id}`,
      duration_ms: 200000,
      explicit: false,
      external_urls: { spotify: `https://open.spotify.com/track/${id}` },
      artists: [
        {
          id: "artist1",
          name: artist,
          external_urls: { spotify: "https://open.spotify.com/artist/artist1" },
        },
      ],
      album: {
        id: "album1",
        name: "Album Name",
        images: [{ url: "https://i.scdn.co/image/album" }],
      },
    },
  };
}

// Test runner
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   ${(error as Error).message}`);
    failed++;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toHaveLength(expected: number) {
      if (!Array.isArray(actual)) {
        throw new Error("Expected an array");
      }
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual.length}`);
      }
    },
    toContain(expected: any) {
      if (!Array.isArray(actual)) {
        throw new Error("Expected an array");
      }
      if (!actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    },
    toEqual(expected: any) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
      }
    },
    toBeLessThan(expected: number) {
      if (typeof actual !== "number") {
        throw new Error("Expected a number");
      }
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
  };
}

console.log("\n🧪 Running Duplicate Finder Tests\n");
console.log("=".repeat(50));

// Test 1: Exact URI Matching
test("should find exact duplicate by URI", () => {
  const left = [createMockTrack("track1", "Song Name", "Artist Name")];
  const right = [createMockTrack("track1", "Song Name", "Artist Name")];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("exact");
  expect(duplicates[0].track.id).toBe("track1");
});

// Test 2: No duplicate
test("should not find duplicate when URIs are different", () => {
  const left = [createMockTrack("track1", "Song Name", "Artist Name")];
  const right = [createMockTrack("track2", "Different Song", "Other Artist")];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(0);
});

// Test 3: Multiple exact duplicates
test("should handle multiple exact duplicates", () => {
  const left = [
    createMockTrack("track1", "Song 1", "Artist"),
    createMockTrack("track2", "Song 2", "Artist"),
    createMockTrack("track3", "Song 3", "Artist"),
  ];
  const right = [
    createMockTrack("track1", "Song 1", "Artist"),
    createMockTrack("track2", "Song 2", "Artist"),
    createMockTrack("track4", "Song 4", "Artist"),
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(2);
});

// Test 4: Fuzzy matching - different URI, same name+artist
test("should find duplicate with different URI but same name+artist", () => {
  const left = [createMockTrack("track1", "Bohemian Rhapsody", "Queen")];
  const right = [
    createMockTrack(
      "track2",
      "Bohemian Rhapsody",
      "Queen",
      "spotify:track:track2",
    ),
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("similar");
});

// Test 5: Remastered version
test("should match track with remastered version", () => {
  const left = [createMockTrack("track1", "Song Name", "Artist Name")];
  const right = [
    createMockTrack(
      "track2",
      "Song Name (Remastered)",
      "Artist Name",
      "spotify:track:track2",
    ),
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("similar");
});

// Test 6: Live version
test("should match track with live version", () => {
  const left = [createMockTrack("track1", "Hotel California", "Eagles")];
  const right = [
    createMockTrack(
      "track2",
      "Hotel California (Live)",
      "Eagles",
      "spotify:track:track2",
    ),
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("similar");
});

// Test 7: Radio Edit
test("should match track with brackets content", () => {
  const left = [createMockTrack("track1", "Song Name", "Artist")];
  const right = [
    createMockTrack(
      "track2",
      "Song Name [Radio Edit]",
      "Artist",
      "spotify:track:track2",
    ),
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("similar");
});

// Test 8: Case insensitive
test("should be case-insensitive", () => {
  const left = [createMockTrack("track1", "SONG NAME", "ARTIST NAME")];
  const right = [
    createMockTrack(
      "track2",
      "song name",
      "artist name",
      "spotify:track:track2",
    ),
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("similar");
});

// Test 9: Extra whitespace
test("should handle extra whitespace", () => {
  const left = [createMockTrack("track1", "Song  Name", "Artist")];
  const right = [
    createMockTrack("track2", "Song    Name", "Artist", "spotify:track:track2"),
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("similar");
});

// Test 10: Empty playlists
test("should handle empty playlists", () => {
  const duplicates = findDuplicates([], []);
  expect(duplicates).toHaveLength(0);
});

// Test 11: Left playlist empty
test("should handle left playlist empty", () => {
  const right = [createMockTrack("track1", "Song", "Artist")];
  const duplicates = findDuplicates([], right);
  expect(duplicates).toHaveLength(0);
});

// Test 12: Right playlist empty
test("should handle right playlist empty", () => {
  const left = [createMockTrack("track1", "Song", "Artist")];
  const duplicates = findDuplicates(left, []);
  expect(duplicates).toHaveLength(0);
});

// Test 13: Different artist
test("should not match if artist is different", () => {
  const left = [createMockTrack("track1", "Song Name", "Artist 1")];
  const right = [
    createMockTrack("track2", "Song Name", "Artist 2", "spotify:track:track2"),
  ];

  const duplicates = findDuplicates(left, right);
  expect(duplicates).toHaveLength(0);
});

// Test 14: Duplicate URIs in right playlist
test("should skip duplicate URIs in right playlist", () => {
  const left = [createMockTrack("track1", "Song", "Artist")];
  const right = [
    createMockTrack("track1", "Song", "Artist"),
    createMockTrack("track1", "Song", "Artist"), // duplicate in right
  ];

  const duplicates = findDuplicates(left, right);
  expect(duplicates).toHaveLength(1); // Should only report once
});

// Test 15: Mix of exact and similar
test("should handle mix of exact and similar duplicates", () => {
  const left = [
    createMockTrack("track1", "Song A", "Artist 1"),
    createMockTrack("track2", "Song B", "Artist 2"),
    createMockTrack("track3", "Song C", "Artist 3"),
  ];
  const right = [
    createMockTrack("track1", "Song A", "Artist 1"), // exact
    createMockTrack(
      "track4",
      "Song B (Remastered)",
      "Artist 2",
      "spotify:track:track4",
    ), // similar
    createMockTrack("track5", "Song D", "Artist 4", "spotify:track:track5"), // no match
  ];

  const duplicates = findDuplicates(left, right);

  expect(duplicates).toHaveLength(2);
});

// Test 16: Featuring artists
test("should handle featuring artists in parentheses", () => {
  const left = [
    createMockTrack("track1", "Song Name (feat. Other Artist)", "Main Artist"),
  ];
  const right = [
    createMockTrack(
      "track2",
      "Song Name",
      "Main Artist",
      "spotify:track:track2",
    ),
  ];

  const duplicates = findDuplicates(left, right);
  expect(duplicates).toHaveLength(1);
  expect(duplicates[0].matchType).toBe("similar");
});

// Test 17: Performance test with large playlists
test("should handle 200 tracks efficiently", () => {
  const left = Array.from({ length: 200 }, (_, i) =>
    createMockTrack(`track${i}`, `Song ${i}`, `Artist ${i}`),
  );

  const right = [
    ...Array.from({ length: 50 }, (_, i) =>
      createMockTrack(`track${i}`, `Song ${i}`, `Artist ${i}`),
    ),
    ...Array.from({ length: 150 }, (_, i) =>
      createMockTrack(
        `track${i + 200}`,
        `Song ${i + 200}`,
        `Artist ${i + 200}`,
      ),
    ),
  ];

  const start = performance.now();
  const duplicates = findDuplicates(left, right);
  const end = performance.now();

  expect(duplicates).toHaveLength(50);
  const timeTaken = end - start;
  console.log(`   ⏱  Time taken: ${timeTaken.toFixed(2)}ms`);

  if (timeTaken > 100) {
    throw new Error(
      `Performance test failed: took ${timeTaken}ms (expected < 100ms)`,
    );
  }
});

// Test 18: normalizeTrackSignature tests
console.log(`\n${"=".repeat(50)}`);
console.log("Testing normalizeTrackSignature function");
console.log("=".repeat(50));

test("should normalize basic track", () => {
  const track = createMockTrack("1", "Song Name", "Artist Name").track;
  expect(normalizeTrackSignature(track)).toBe("song name|artist name");
});

test("should remove parentheses content", () => {
  const track = createMockTrack("1", "Song (Remastered)", "Artist").track;
  expect(normalizeTrackSignature(track)).toBe("song|artist");
});

test("should remove bracket content", () => {
  const track = createMockTrack("1", "Song [Radio Edit]", "Artist").track;
  expect(normalizeTrackSignature(track)).toBe("song|artist");
});

test("should normalize whitespace", () => {
  const track = createMockTrack("1", "Song  Name   Here", "Artist").track;
  expect(normalizeTrackSignature(track)).toBe("song name here|artist");
});

test("should handle missing artist", () => {
  const track = createMockTrack("1", "Song", "Artist").track;
  track.artists = [];
  expect(normalizeTrackSignature(track)).toBe("song|unknown");
});

test("should handle complex nested parentheses", () => {
  const track = createMockTrack(
    "1",
    "Song (feat. Artist) (Remix) [Live]",
    "Main Artist",
  ).track;
  expect(normalizeTrackSignature(track)).toBe("song|main artist");
});

// Summary
console.log(`\n${"=".repeat(50)}`);
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(50)}\n`);

if (failed > 0) {
  process.exit(1);
}
