import { useState, useEffect, useRef } from "react";
import { useRepos } from "./useRepos";

const MAX_CACHE_SIZE = 100;
const posterCache = new Map();

function addToCache(key, value) {
  if (posterCache.size >= MAX_CACHE_SIZE) {
    const firstKey = posterCache.keys().next().value;
    posterCache.delete(firstKey);
  }
  posterCache.set(key, value);
}

export function useMoviePoster(movie) {
  const { posterRepository } = useRepos();
  const cacheKey = movie?.id;
  const isMountedRef = useRef(true);

  const [posterUrl, setPosterUrl] = useState(() => {
    if (cacheKey && posterCache.has(cacheKey)) {
      return posterCache.get(cacheKey);
    }
    return null;
  });

  useEffect(() => {
    if (!movie || !cacheKey) return;

    if (posterCache.has(cacheKey)) {
      return;
    }

    isMountedRef.current = true;

    posterRepository
      .getPoster({ name: movie.title, year: movie.year })
      .then((res) => {
        if (res !== null && isMountedRef.current) {
          addToCache(cacheKey, res);
          setPosterUrl(res);
        }
      })
      .catch(console.error);

    return () => {
      isMountedRef.current = false;
    };
  }, [movie, posterRepository, cacheKey]);

  return { posterUrl };
}
