import { MovieRepository } from "../repositories/MovieRepository";
import { PosterRepository } from "../repositories/PosterRepository";
import { RepositoriesContext } from "../hooks/useRepos";

const movieRepository = new MovieRepository();
const posterRepository = new PosterRepository();

export function RepositoriesProvider({ children }) {
  return (
    <RepositoriesContext.Provider value={{ movieRepository, posterRepository }}>
      {children}
    </RepositoriesContext.Provider>
  );
}
