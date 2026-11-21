import "./MovieCard.css";
import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";
import MovieSemiWatchedIcon from "@/components/MovieSemiWatchedIcon/MovieSemiWatchedIcon";
import Tooltip from "@/components/Tooltip/Tooltip";

function MovieCard({
  movie,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
}) {
  const navigate = useNavigate();
  const [isImageReady, setIsImageReady] = useState(!movie.poster_url);
  const [imageFailed, setImageFailed] = useState(false);

  const handleClick = useCallback(() => {
    if (isSelectionMode) {
      onToggleSelection?.(movie.id);
      return;
    }

    navigate(`/movies/${movie.id}`, { state: { movie } });
  }, [navigate, movie, isSelectionMode, onToggleSelection]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!isSelectionMode) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggleSelection?.(movie.id);
      }
    },
    [isSelectionMode, onToggleSelection, movie.id],
  );

  const showIcon = movie.watched_by.watcher_users > 0;
  const isFullyWatched =
    movie.watched_by.watcher_users === movie.watched_by.total_users;

  const classNames = `movie-card ${!isImageReady && "skeleton"} ${showIcon && "corner-shadow"} ${isSelected && "movie-card--selected"}`;

  return (
    <div
      className={classNames}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isSelectionMode ? "checkbox" : undefined}
      aria-checked={isSelectionMode ? isSelected : undefined}
      tabIndex={isSelectionMode ? 0 : undefined}
    >
      {movie.poster_url && !imageFailed ? (
        <img
          src={movie.poster_url ?? undefined}
          style={{ display: isImageReady ? "block" : "none" }}
          onLoad={() => setIsImageReady(true)}
          onError={() => {
            setIsImageReady(true);
            setImageFailed(true);
          }}
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
              <MovieSemiWatchedIcon size={26} color="var(--semi-watched-clr)" />
            )}
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default memo(MovieCard);
