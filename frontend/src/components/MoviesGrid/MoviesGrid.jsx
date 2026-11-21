import "./MoviesGrid.css";
import MovieCard from "@/components/MovieCard/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton/MovieCardSkeleton";

function MoviesGrid({
  movies,
  isLoading,
  maxMovies,
  isSelectionMode = false,
  selectedIds,
  onToggleSelection,
}) {
  return (
    <ul className="movies-grid">
      {isLoading
        ? Array.from({ length: maxMovies }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        : movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds?.has(movie.id) ?? false}
              onToggleSelection={onToggleSelection}
            />
          ))}
    </ul>
  );
}

export default MoviesGrid;
