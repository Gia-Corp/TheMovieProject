import { createContext } from "react";
import { MovieApiService } from "../services/movieApiService";

export const MovieApiServiceContext = createContext(null);

function MovieApiServiceProvider({ children }) {
  const movieApiService = new MovieApiService();

  return (
    <MovieApiServiceContext.Provider value={movieApiService}>
      {children}
    </MovieApiServiceContext.Provider>
  );
}

export default MovieApiServiceProvider;
