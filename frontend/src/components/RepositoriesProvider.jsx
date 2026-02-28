import { createContext, useContext } from "react";
import { MovieRepository } from "../repositories/MovieRepository";
import { PosterRepository } from "../repositories/PosterRepository";

const RepositoriesContext = createContext();
const movieRepository = new MovieRepository();
const posterRepository = new PosterRepository();

export function RepositoriesProvider({ children }) {
  return (
    <RepositoriesContext.Provider value={{ movieRepository, posterRepository }}>
      {children}
    </RepositoriesContext.Provider>
  );
}

export const useRepos = () => useContext(RepositoriesContext);
