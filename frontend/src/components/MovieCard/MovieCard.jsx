import "./MovieCard.css";
import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";
import MovieSemiWatchedIcon from "@/components/MovieSemiWatchedIcon/MovieSemiWatchedIcon";
import Tooltip from "@/components/Tooltip/Tooltip";

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const [isImageReady, setIsImageReady] = useState(!movie.poster_url);

  const handleClick = useCallback(() => {
    navigate(`/movies/${movie.id}`, { state: { movie } });
  }, [navigate, movie]);

  const showIcon = movie.watched_by.watcher_users > 0;
  const isFullyWatched =
    movie.watched_by.watcher_users === movie.watched_by.total_users;

  const classNames = `movie-card ${!isImageReady && "skeleton"} ${showIcon && "corner-shadow"}`;

  return (
    <div className={classNames} onClick={handleClick}>
      {movie.poster_url ? (
        <img
          src={movie.poster_url ?? undefined}
          style={{ display: isImageReady ? "block" : "none" }}
          onLoad={() => setIsImageReady(true)}
          onError={() => setIsImageReady(true)}
        />
      ) : (
        <p>{movie.title}</p>
      )}
      {showIcon && (
        <div className="movie-card-icon">
          <Tooltip
            content={
              <span>
                {isFullyWatched
                  ? "Todos la han visto"
                  : "Al menos uno la ha visto"}
              </span>
            }
          >
            {isFullyWatched ? (
              <MovieWatchedIcon size={30} />
            ) : (
              <MovieSemiWatchedIcon size={26} />
            )}
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default memo(MovieCard);
