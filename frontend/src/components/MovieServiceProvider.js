import React, { createContext} from 'react';
import { MovieService } from '../services/movieService';

export const MovieServiceContext = createContext(null);

const MovieServiceProvider = ({ children }) => {
    const movieService = new MovieService();
  
    return (
      <MovieServiceContext.Provider value={movieService}>
        {children}
      </MovieServiceContext.Provider>
    );
}

export default MovieServiceProvider;