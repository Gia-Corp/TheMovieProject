import { useLocation } from "react-router-dom";
import "./MovieDetail.css";
import { useRepos } from "../../hooks/useRepos";
import { useState, useEffect } from "react";
import checkIcon from "../../assets/icons/check_circle.svg";

function MovieDetail() {
  const { state } = useLocation();
  const { movie, moviePosterUrl } = state;
  const [posterUrl, setPosterUrl] = useState(moviePosterUrl ?? null);
  const { movieRepository, posterRepository } = useRepos();
  const isLoading = posterUrl === null;
  const [isWatched, setIsWatched] = useState(movie.watched);

  useEffect(() => {
    posterRepository
      .getPoster({ name: movie.title, year: movie.year })
      .then((res) => {
        if (res === null) return;
        setPosterUrl(res);
      })
      .catch(console.error);
  }, [movie, posterRepository]);

  const handleToggleWatched = (movieId) => {
    setIsWatched(!isWatched);
    movieRepository.updateMovie(movieId, { watched: !isWatched });
  };

  return (
    <div className="movie-detail-page">
      <div className="detail-section">
        <h2>{movie.title}</h2>
        <p>Dirigida por: {movie.director}</p>
        <p>Año: {movie.year}</p>
        <div className="watched-section">
          {isWatched ? (
            <img src={checkIcon} alt="vista" className="check-icon" />
          ) : (
            ""
          )}
          {
            <button onClick={() => handleToggleWatched(movie.id)}>
              {isWatched ? "Marcar como no vista" : "Marcar como vista"}
            </button>
          }
        </div>
      </div>
      <div className="poster-section">
        {isLoading ? (
          "Cargando poster..."
        ) : (
          <img src={posterUrl} alt={movie.title} />
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
