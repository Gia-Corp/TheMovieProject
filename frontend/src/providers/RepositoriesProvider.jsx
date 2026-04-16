import { useMemo } from "react";
import { MovieRepository } from "@/repositories/MovieRepository";
import { ExternalMovieRepository } from "@/repositories/ExternalMovieRepository";
import { RepositoriesContext } from "@/hooks/useRepos";
import { useAuth } from "@/hooks/useAuth";
import { buildApiFetch } from "@/apiFetch";

export function RepositoriesProvider({ children }) {
  const { setAccessToken } = useAuth();

  const apiFetch = useMemo(
    () => buildApiFetch(setAccessToken),
    [setAccessToken],
  );

  const repositories = useMemo(
    () => ({
      movieRepository: new MovieRepository(apiFetch),
      externalMovieRepository: new ExternalMovieRepository(apiFetch),
    }),
    [apiFetch],
  );

  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
}
