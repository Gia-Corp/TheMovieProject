import "./MovieDetail.css";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useRepos } from "@/hooks/useRepos";
import MovieWatchedButton from "@/components/MovieWatchedButton/MovieWatchedButton";

function MovieDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const { movieRepository } = useRepos();
  const [movie, setMovie] = useState(state?.movie ?? null);
  const [isWatched, setIsWatched] = useState(movie?.watched ?? false);
  const [isImageReady, setIsImageReady] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(!movie.plot);

  useEffect(() => {
    if (movie.plot) return;

    movieRepository
      .getMovie(id)
      .then((res) => {
        setMovie(res);
        setIsWatched(res.watched);
        setIsLoading(false);
      })
      .catch(setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnClick = () => {
    setIsWatched(!isWatched);
    movieRepository
      .updateMovie(movie.id, { watched: !isWatched })
      .catch(() => setIsWatched(isWatched));
  };

  if (error) throw error;

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="movie-detail-page">
      <div className="detail-section">
        <h2>{movie.title}</h2>
        <p>{movie.plot}</p>
        {movie.director !== null ? <p>Dirigida por: {movie.director}</p> : null}
        {movie.runtime !== null ? <p>Duración: {movie.runtime}</p> : null}
        <span>
          <p>{movie.year}</p>
        </span>
        <MovieWatchedButton isWatched={isWatched} onClick={handleOnClick} />
      </div>
      <div className="poster-section">
        {!isImageReady && movie.poster_url && <div className="skeleton" />}
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            style={{ display: isImageReady ? "block" : "none" }}
            onLoad={() => setIsImageReady(true)}
            onError={() => setIsImageReady(true)}
          />
        ) : (
          <p>No tiene poster :/</p>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
