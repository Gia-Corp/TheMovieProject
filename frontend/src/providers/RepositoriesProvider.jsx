import { MovieRepository } from "@/repositories/MovieRepository";
import { ExternalMovieRepository } from "@/repositories/ExternalMovieRepository";
import { RepositoriesContext } from "@/hooks/useRepos";

const movieRepository = new MovieRepository();
const externalMovieRepository = new ExternalMovieRepository();

export function RepositoriesProvider({ children }) {
  return (
    <RepositoriesContext.Provider
      value={{ movieRepository, externalMovieRepository }}
    >
      {children}
    </RepositoriesContext.Provider>
  );
}
