import MovieWatchedIcon from "../MovieWatchedIcon/MovieWatchedIcon";

function MovieWatchedButton({ isWatched, onClick }) {
  return (
    <div style={{ cursor: "pointer" }}>
      {isWatched ? (
        <MovieWatchedIcon onClick={onClick} size={60} />
      ) : (
        <MovieWatchedIcon onClick={onClick} size={60} color="grey" />
      )}
    </div>
  );
}

export default MovieWatchedButton;
