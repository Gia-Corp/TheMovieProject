const CACHE_TTLS = {
  movie: 60 * 1000,
  user: 5 * 60 * 1000,
  external: 24 * 60 * 60 * 1000,
};

const MAX_CACHE_ENTRIES = 200;

const cache = new Map();

let refreshPromise = null;

function normalizeUrl(url) {
  const value = typeof url === "string" ? url : url.toString();
  return new URL(value, window.location.origin);
}

function cacheKey(url) {
  return normalizeUrl(url).href;
}

function getTtlMs(url) {
  const { origin, pathname } = normalizeUrl(url);

  if (origin !== window.location.origin) return CACHE_TTLS.external;
  if (pathname.startsWith("/api/users")) return CACHE_TTLS.user;

  return CACHE_TTLS.movie;
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

function storeInCache(url, data) {
  const key = cacheKey(url);

  if (cache.size >= MAX_CACHE_ENTRIES && !cache.has(key)) {
    cache.delete(cache.keys().next().value);
  }

  cache.set(key, {
    data,
    storedAt: Date.now(),
    ttlMs: getTtlMs(url),
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
    return;
  }

  if (pathname.startsWith("/api/users/")) {
    cache.delete(cacheKey(url));
  }
}

export function clearRequestCache() {
  cache.clear();
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

export function buildApiFetch(setAccessToken, setCurrentUser) {
  return async function apiFetch(url, options = {}) {
    const method = (options.method ?? "GET").toUpperCase();
    const cacheable = method === "GET" && isCacheable(url);
    const key = cacheable ? cacheKey(url) : null;
    const entry = cacheable ? cache.get(key) : null;

    if (entry) {
      if (Date.now() - entry.storedAt < entry.ttlMs) {
        return buildJsonResponse(entry.data);
      }

      cache.delete(key);
    }

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

      response = await fetch(url, options);
    }

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
