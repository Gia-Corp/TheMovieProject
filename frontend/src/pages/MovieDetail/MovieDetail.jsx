import { useLocation } from "react-router-dom";
import "./MovieDetail.css";
import { useRepos } from "../../hooks/useRepos";
import { useState, useEffect } from "react";

function MovieDetail() {
  const { state } = useLocation();
  const { movie, moviePosterUrl } = state;
  const [posterUrl, setPosterUrl] = useState(moviePosterUrl ?? null);
  const { posterRepository } = useRepos();
  const isLoading = posterUrl === null;

  useEffect(() => {
    posterRepository
      .getPoster({ name: movie.title, year: movie.year })
      .then((res) => {
        if (res === null) return;
        setPosterUrl(res);
      })
      .catch(console.error);
  }, [movie, posterRepository]);

  return (
    <div className="movie-detail-page">
      <div className="detail-section">
        <h2>{movie.title}</h2>
        <p>Dirigida por: {movie.director}</p>
        <p>Año: {movie.year}</p>
        <p>{movie.watched ? "Vista" : "No vista"}</p>
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
