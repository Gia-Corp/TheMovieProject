import MovieCard from "../MovieCard/MovieCard";
import MovieCardSkeleton from "../MovieCardSkeleton/MovieCardSkeleton";
import "./MoviesList.css";

function MoviesList({ movies, isLoading }) {
  return (
    <ul className="movies-list">
      {isLoading
        ? Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </ul>
  );
}

export default MoviesList;
