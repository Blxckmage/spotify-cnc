/**
 * Custom fetch wrapper with retry logic and error handling for Spotify API
 * Based on patterns from spotify-dedup for production reliability
 */

interface RetryOptions {
  maxRetries?: number;
  backoffMultiplier?: number;
  baseDelay?: number;
  onTokenRefresh?: () => Promise<string>;
}

interface SpotifyErrorResponse {
  error: {
    status: number;
    message: string;
  };
}

export class SpotifyFetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: SpotifyErrorResponse,
  ) {
    super(message);
    this.name = "SpotifyFetchError";
  }
}

/**
 * Enhanced fetch with automatic retry logic and rate limit handling
 */
export async function spotifyFetch(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {},
): Promise<Response> {
  const {
    maxRetries = 3,
    backoffMultiplier = 1.3,
    baseDelay = 1000,
    onTokenRefresh,
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success - return response
      if (response.ok) {
        return response;
      }

      // Handle different error types
      if (response.status === 429) {
        // Rate limited - respect Retry-After header
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter
          ? Number.parseInt(retryAfter, 10) * 1000
          : calculateBackoffDelay(baseDelay, backoffMultiplier, attempt);

        console.warn(
          `Rate limited (429). Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`,
        );

        if (attempt < maxRetries) {
          await sleep(delay);
          continue;
        }
      } else if (response.status === 401 && onTokenRefresh && attempt === 1) {
        // Token expired - try to refresh once
        console.warn("Token expired (401). Attempting to refresh...");

        try {
          const newToken = await onTokenRefresh();

          // Update authorization header and retry
          const headers = new Headers(options.headers);
          headers.set("Authorization", `Bearer ${newToken}`);

          return await fetch(url, {
            ...options,
            headers,
          });
        } catch (_refreshError) {
          throw new SpotifyFetchError(
            "Failed to refresh token",
            401,
            await response.json().catch(() => undefined),
          );
        }
      } else if (response.status === 400) {
        // Bad request - don't retry
        const errorData: SpotifyErrorResponse = await response
          .json()
          .catch(() => ({
            error: { status: 400, message: response.statusText },
          }));

        throw new SpotifyFetchError(
          `Bad request: ${errorData.error?.message || response.statusText}`,
          400,
          errorData,
        );
      } else if (response.status >= 500) {
        // Server error - retry with backoff
        const delay = calculateBackoffDelay(
          baseDelay,
          backoffMultiplier,
          attempt,
        );

        console.warn(
          `Server error (${response.status}). Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`,
        );

        if (attempt < maxRetries) {
          await sleep(delay);
          continue;
        }
      }

      // Other errors - throw immediately
      const errorData: SpotifyErrorResponse = await response
        .json()
        .catch(() => ({
          error: { status: response.status, message: response.statusText },
        }));

      throw new SpotifyFetchError(
        `Spotify API error: ${errorData.error?.message || response.statusText}`,
        response.status,
        errorData,
      );
    } catch (error) {
      lastError = error as Error;

      // If it's a SpotifyFetchError, don't retry
      if (error instanceof SpotifyFetchError) {
        throw error;
      }

      // Network errors - retry with backoff
      if (attempt < maxRetries) {
        const delay = calculateBackoffDelay(
          baseDelay,
          backoffMultiplier,
          attempt,
        );
        console.warn(
          `Network error. Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`,
        );
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error("Max retries exceeded");
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(
  baseDelay: number,
  backoffMultiplier: number,
  attempt: number,
): number {
  return baseDelay * backoffMultiplier ** (attempt - 1);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
