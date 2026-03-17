import { useLocation } from "react-router-dom";
import "./MovieDetail.css";
import { useMoviePoster } from "../../hooks/useMoviePoster";
import { useRepos } from "../../hooks/useRepos";
import { useState } from "react";
import MovieWatchedIcon from "../../components/MovieWatchedIcon/MovieWatchedIcon";

function MovieDetail() {
  const { state } = useLocation();
  const { movie, posterUrl: passedPosterUrl } = state;
  const { posterUrl } = useMoviePoster(movie);
  const { movieRepository } = useRepos();
  const [isWatched, setIsWatched] = useState(movie.watched);
  const [isImageReady, setIsImageReady] = useState(false);

  const effectivePosterUrl = posterUrl || passedPosterUrl;

  const handleOnClick = () => {
    setIsWatched(!isWatched);
    movieRepository.updateMovie(movie.id, { watched: !isWatched });
  };

  return (
    <div className="movie-detail-page">
      <div className="detail-section">
        <h2>{movie.title}</h2>
        <p>Dirigida por: {movie.director}</p>
        <p>Año: {movie.year}</p>
        <div className="watched-section">
          {isWatched ? <MovieWatchedIcon size={60} /> : null}
          <button onClick={handleOnClick}>
            {isWatched ? "Marcar como no vista" : "Marcar como vista"}
          </button>
        </div>
      </div>
      <div className="poster-section">
        {!isImageReady && <div className="skeleton" />}
        {effectivePosterUrl && (
          <img
            src={effectivePosterUrl}
            alt={movie.title}
            style={{ display: isImageReady ? "block" : "none" }}
            onLoad={() => setIsImageReady(true)}
            onError={() => setIsImageReady(true)}
          />
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
