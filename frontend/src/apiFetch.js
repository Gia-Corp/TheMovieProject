const CACHE_POLICIES = {
  movie: { ttlMs: 60 * 1000, staleMs: 5 * 60 * 1000 },
  user: { ttlMs: 5 * 60 * 1000, staleMs: 60 * 1000 },
  external: { ttlMs: 24 * 60 * 60 * 1000, staleMs: 7 * 24 * 60 * 60 * 1000 },
};

const MAX_CACHE_ENTRIES = 200;

const cache = new Map();
const revalidating = new Set();

let refreshPromise = null;
let cacheEpoch = 0;

function normalizeUrl(url) {
  const value = typeof url === "string" ? url : url.toString();
  return new URL(value, window.location.origin);
}

function cacheKey(url) {
  return normalizeUrl(url).href;
}

function getCachePolicy(url) {
  const { origin, pathname } = normalizeUrl(url);

  if (origin !== window.location.origin) return CACHE_POLICIES.external;
  if (pathname.startsWith("/api/users")) return CACHE_POLICIES.user;

  return CACHE_POLICIES.movie;
}

function isCacheable(url) {
  const { pathname } = normalizeUrl(url);
  return !pathname.startsWith("/auth");
}

function buildJsonResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function createAbortError() {
  return new DOMException("The operation was aborted.", "AbortError");
}

export function isAbortError(error) {
  return error?.name === "AbortError";
}

function storeInCache(url, data) {
  const key = cacheKey(url);

  if (cache.size >= MAX_CACHE_ENTRIES && !cache.has(key)) {
    cache.delete(cache.keys().next().value);
  }

  const { ttlMs, staleMs } = getCachePolicy(url);
  cache.set(key, {
    data,
    storedAt: Date.now(),
    ttlMs,
    staleMs,
  });
}

function invalidateMovieEntries(movieId) {
  for (const key of cache.keys()) {
    const { pathname } = new URL(key);

    if (pathname === "/api/movies") {
      cache.delete(key);
      continue;
    }

    if (movieId && pathname === `/api/movies/${movieId}`) {
      cache.delete(key);
    }
  }
}

function invalidateAfterMutation(url) {
  const { pathname } = normalizeUrl(url);

  if (pathname.startsWith("/api/movies")) {
    const match = pathname.match(/^\/api\/movies\/([^/]+)/);
    invalidateMovieEntries(match ? match[1] : null);
    cacheEpoch += 1;
    return;
  }

  if (pathname.startsWith("/api/users/")) {
    cache.delete(cacheKey(url));
    cacheEpoch += 1;
  }
}

export function clearRequestCache() {
  cache.clear();
  cacheEpoch += 1;
}

async function refreshSession(setAccessToken, setCurrentUser) {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("SESSION_EXPIRED");

      const { access_token, user } = await response.json();
      setAccessToken(access_token);
      setCurrentUser(user);
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function runRequest(url, options, setAccessToken, setCurrentUser) {
  let response = await fetch(url, options);

  if (response.status === 401) {
    try {
      await refreshSession(setAccessToken, setCurrentUser);
    } catch {
      clearRequestCache();
      setAccessToken(null);
      setCurrentUser(null);
      throw new Error("SESSION_EXPIRED");
    }

    if (options.signal?.aborted) throw createAbortError();

    response = await fetch(url, options);
  }

  return response;
}

export function buildApiFetch(setAccessToken, setCurrentUser) {
  function revalidateInBackground(key, url, options) {
    if (revalidating.has(key)) return;
    revalidating.add(key);

    const epoch = cacheEpoch;
    const backgroundOptions = { ...options };
    delete backgroundOptions.signal;

    runRequest(url, backgroundOptions, setAccessToken, setCurrentUser)
      .then(async (response) => {
        if (!response.ok) return;

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) return;

        const data = await response.json();
        if (cacheEpoch === epoch) storeInCache(url, data);
      })
      .catch(() => {
        // La revalidación es best-effort: se conserva el dato viejo.
      })
      .finally(() => revalidating.delete(key));
  }

  return async function apiFetch(url, options = {}) {
    const { signal } = options;

    if (signal?.aborted) throw createAbortError();

    const method = (options.method ?? "GET").toUpperCase();
    const cacheable = method === "GET" && isCacheable(url);
    const key = cacheable ? cacheKey(url) : null;
    const entry = cacheable ? cache.get(key) : null;

    if (entry) {
      const age = Date.now() - entry.storedAt;

      if (age < entry.ttlMs) {
        return buildJsonResponse(entry.data);
      }

      if (age < entry.ttlMs + entry.staleMs) {
        revalidateInBackground(key, url, options);
        return buildJsonResponse(entry.data);
      }

      cache.delete(key);
    }

    const response = await runRequest(
      url,
      options,
      setAccessToken,
      setCurrentUser,
    );

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const body = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const error = new Error(
        body?.detail ?? body?.message ?? body ?? "Error desconocido",
      );
      error.status = response.status;
      throw error;
    }

    if (method !== "GET") {
      invalidateAfterMutation(url);
    }

    if (
      cacheable &&
      response.headers.get("content-type")?.includes("application/json")
    ) {
      const data = await response.json();
      storeInCache(url, data);
      return buildJsonResponse(data);
    }

    return response;
  };
}
