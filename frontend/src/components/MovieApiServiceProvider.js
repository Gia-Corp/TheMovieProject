import React, { createContext} from 'react';
import { MovieApiService } from '../services/movieApiService';

export const MovieApiServiceContext = createContext(null);

const MovieApiServiceProvider = ({ children }) => {
    const movieApiService = new MovieApiService();
  
    return (
      <MovieApiServiceContext.Provider value={movieApiService}>
        {children}
      </MovieApiServiceContext.Provider>
    );
}

export default MovieApiServiceProvider;