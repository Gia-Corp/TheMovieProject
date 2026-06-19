import "./MovieWatchedButton.css";
import MovieSemiWatchedIcon from "@/components/MovieSemiWatchedIcon/MovieSemiWatchedIcon";

function MovieWatchedButton({ isWatched, onClick, disabled }) {
  return (
    <button
      className="movie-watched-button"
      onClick={onClick}
      disabled={disabled}
    >
      <MovieSemiWatchedIcon size={29} color={isWatched ? undefined : "grey"} />
    </button>
  );
}

export default MovieWatchedButton;
