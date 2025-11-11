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

      if (response.ok) {
        return response;
      }

      if (response.status === 429) {
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
        console.warn("Token expired (401). Attempting to refresh...");

        try {
          const newToken = await onTokenRefresh();

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

      if (error instanceof SpotifyFetchError) {
        throw error;
      }

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

  throw lastError || new Error("Max retries exceeded");
}

function calculateBackoffDelay(
  baseDelay: number,
  backoffMultiplier: number,
  attempt: number,
): number {
  return baseDelay * backoffMultiplier ** (attempt - 1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
