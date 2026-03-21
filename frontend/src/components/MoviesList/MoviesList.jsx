import "./MoviesList.css";
import MovieCard from "@/components/MovieCard/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton/MovieCardSkeleton";

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
