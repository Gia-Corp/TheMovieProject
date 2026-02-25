import { createContext } from "react";
import { MovieService } from "../services/movieService";

export const MovieServiceContext = createContext(null);

function MovieServiceProvider({ children }) {
  const movieService = new MovieService();

  return (
    <MovieServiceContext.Provider value={movieService}>
      {children}
    </MovieServiceContext.Provider>
  );
}

export default MovieServiceProvider;
