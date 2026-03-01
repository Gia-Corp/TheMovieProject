import MovieCard from "../MovieCard/MovieCard";
import MovieCardSkeleton from "../MovieCardSkeleton/MovieCardSkeleton";
import "./MoviesList.css";

function MoviesList({ list, isLoading }) {
  return (
    <ul className="movies-list">
      {isLoading
        ? Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))
        : list.map((item) => <MovieCard key={item.id} item={item} />)}
    </ul>
  );
}

export default MoviesList;
