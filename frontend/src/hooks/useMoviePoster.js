import { useState, useEffect } from "react";
import { useRepos } from "./useRepos";

export function useMoviePoster(movie) {
  const { posterRepository } = useRepos();
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    if (!movie) return;

    posterRepository
      .getPoster({ name: movie.title, year: movie.year })
      .then((res) => {
        if (res !== null) {
          setPosterUrl(res);
        }
      })
      .catch(console.error);
  }, [movie, posterRepository]);

  return { posterUrl };
}
