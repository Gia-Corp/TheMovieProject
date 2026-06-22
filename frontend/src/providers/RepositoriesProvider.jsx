import { useMemo } from "react";
import { MovieRepository } from "@/repositories/MovieRepository";
import { ExternalMovieRepository } from "@/repositories/ExternalMovieRepository";
import { RepositoriesContext } from "@/hooks/useRepos";
import { useAuth } from "@/hooks/useAuth";
import { buildApiFetch } from "@/apiFetch";

export function RepositoriesProvider({ children }) {
  const { setAccessToken, setCurrentUser } = useAuth();

  const apiFetch = useMemo(
    () => buildApiFetch(setAccessToken, setCurrentUser),
    [setAccessToken, setCurrentUser],
  );

  const repositories = useMemo(
    () => ({
      movieRepo: new MovieRepository(apiFetch),
      externalMovieRepo: new ExternalMovieRepository(apiFetch),
    }),
    [apiFetch],
  );

  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
}
