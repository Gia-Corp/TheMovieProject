import { createContext } from "react";
import { MovieApiService } from "../services/movieApiService";
import PropTypes from "prop-types";

export const MovieApiServiceContext = createContext(null);

function MovieApiServiceProvider({ children }) {
  const movieApiService = new MovieApiService();

  return (
    <MovieApiServiceContext.Provider value={movieApiService}>
      {children}
    </MovieApiServiceContext.Provider>
  );
}

MovieApiServiceProvider.propTypes = {
  children: PropTypes.any,
};

export default MovieApiServiceProvider;
