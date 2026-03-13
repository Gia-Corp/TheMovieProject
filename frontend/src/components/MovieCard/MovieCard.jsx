import "./MovieCard.css";
import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useMoviePoster } from "../../hooks/useMoviePoster";
import MovieWatchedIcon from "../MovieWatchedIcon/MovieWatchedIcon";

function MovieCard({ movie }) {
  const { posterUrl } = useMoviePoster(movie);
  const navigate = useNavigate();
  const [isImageReady, setIsImageReady] = useState(false);

  const handleClick = useCallback(() => {
    navigate(`/movies/${movie.id}`, { state: { movie, posterUrl } });
  }, [navigate, movie, posterUrl]);

  return (
    <div className={isImageReady ? "movie-card" : "movie-card skeleton"}>
      <img
        onClick={handleClick}
        src={posterUrl === null ? null : posterUrl}
        style={{ display: isImageReady ? "block" : "none" }}
        onLoad={() => setIsImageReady(true)}
        onError={() => setIsImageReady(true)}
      />
      <div>{movie["watched"] ? <MovieWatchedIcon size={40} /> : null}</div>
    </div>
  );
}

export default memo(MovieCard);
