import "./MoviesGrid.css";
import MovieCard from "@/components/MovieCard/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton/MovieCardSkeleton";

function MoviesGrid({ movies, isLoading, maxMovies }) {
  return (
    <ul className="movies-grid">
      {isLoading
        ? Array.from({ length: maxMovies }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </ul>
  );
}

export default MoviesGrid;
