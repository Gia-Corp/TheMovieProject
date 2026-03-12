import "./MovieWatchedIcon.css";
import checkIcon from "../../assets/icons/check_circle.svg";

function MovieWatchedIcon({ size }) {
  return (
    <img
      src={checkIcon}
      style={{ width: `${size}px` }}
      className="movie-watched-icon"
    />
  );
}

export default MovieWatchedIcon;
