import "./MovieCard.css";
import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [isImageReady, setIsImageReady] = useState(!movie.poster_url);

  const handleClick = useCallback(() => {
    navigate(`/movies/${movie.id}`, { state: { movie } });
  }, [navigate, movie]);

  return (
    <div
      className={isImageReady ? "movie-card" : "movie-card skeleton"}
      onClick={handleClick}
    >
      {movie.poster_url ? (
        <img
          src={movie.poster_url === null ? null : movie.poster_url}
          style={{ display: isImageReady ? "block" : "none" }}
          onLoad={() => setIsImageReady(true)}
          onError={() => setIsImageReady(true)}
        />
      ) : (
        <p>{movie.title}</p>
      )}
      <div>{movie.watched ? <MovieWatchedIcon /> : null}</div>
    </div>
  );
}

export default memo(MovieCard);
