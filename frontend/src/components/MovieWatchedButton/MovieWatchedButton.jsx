import "./MovieWatchedButton.css";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";

function MovieWatchedButton({ isWatched, onClick, disabled }) {
  return (
    <button
      className="movie-watched-button"
      onClick={onClick}
      disabled={disabled}
    >
      <MovieWatchedIcon size={30} color={isWatched ? undefined : "grey"} />
    </button>
  );
}

export default MovieWatchedButton;
