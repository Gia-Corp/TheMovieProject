import { useLocation } from "react-router-dom";
import "./MovieDetail.css";
import { useRepos } from "../../hooks/useRepos";
import { useState, useEffect } from "react";
import MovieWatchedIcon from "../../components/MovieWatchedIcon/MovieWatchedIcon";

function MovieDetail() {
  const { state } = useLocation();
  const { movie, moviePosterUrl } = state;
  const [posterUrl, setPosterUrl] = useState(moviePosterUrl ?? null);
  const { movieRepository, posterRepository } = useRepos();
  const [isWatched, setIsWatched] = useState(movie.watched);
  const [isPosterReady, setIsPosterReady] = useState(false);

  useEffect(() => {
    posterRepository
      .getPoster({ name: movie.title, year: movie.year })
      .then((res) => {
        if (res === null) return;
        setPosterUrl(res);
      })
      .catch(console.error);
  }, [movie, posterRepository]);

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
        {!isPosterReady && <div className="skeleton" />}
        {posterUrl && (
          <img
            src={posterUrl}
            alt={movie.title}
            style={{ display: isPosterReady ? "block" : "none" }}
            onLoad={() => setIsPosterReady(true)}
            onError={() => setIsPosterReady(true)}
          />
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
