import { MovieRepository } from "@/repositories/MovieRepository";
import { ExternalMovieRepository } from "@/repositories/ExternalMovieRepository";
import { PosterRepository } from "@/repositories/PosterRepository";
import { RepositoriesContext } from "@/hooks/useRepos";

const movieRepository = new MovieRepository();
const posterRepository = new PosterRepository();
const externalMovieRepository = new ExternalMovieRepository();

export function RepositoriesProvider({ children }) {
  return (
    <RepositoriesContext.Provider
      value={{ movieRepository, posterRepository, externalMovieRepository }}
    >
      {children}
    </RepositoriesContext.Provider>
  );
}
