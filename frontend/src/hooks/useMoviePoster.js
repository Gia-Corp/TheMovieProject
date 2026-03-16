import { useState, useEffect, useRef } from "react";
import { useRepos } from "./useRepos";
import { posterCache } from "../utils/PosterCache";

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
          posterCache.set(cacheKey, res);
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
