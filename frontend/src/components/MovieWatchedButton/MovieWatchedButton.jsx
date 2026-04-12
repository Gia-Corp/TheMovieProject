import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";

function MovieWatchedButton({ isWatched, onClick }) {
  return (
    <div style={{ cursor: "pointer" }}>
      <MovieWatchedIcon
        onClick={onClick}
        size={30}
        color={isWatched ? undefined : "grey"}
      />
    </div>
  );
}

export default MovieWatchedButton;
