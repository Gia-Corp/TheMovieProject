import { createContext } from "react";
import { MovieService } from "../services/movieService";
import PropTypes from "prop-types";

export const MovieServiceContext = createContext(null);

function MovieServiceProvider({ children }) {
  const movieService = new MovieService();

  return (
    <MovieServiceContext.Provider value={movieService}>
      {children}
    </MovieServiceContext.Provider>
  );
}

MovieServiceProvider.propTypes = {
  children: PropTypes.any,
};

export default MovieServiceProvider;
