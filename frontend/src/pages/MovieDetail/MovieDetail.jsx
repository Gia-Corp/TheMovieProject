import { useLocation, useParams } from "react-router-dom";
import "./MovieDetail.css";
import { useMoviePoster } from "../../hooks/useMoviePoster";
import { useRepos } from "../../hooks/useRepos";
import { useState, useEffect } from "react";
import MovieWatchedIcon from "../../components/MovieWatchedIcon/MovieWatchedIcon";

function MovieDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const { movieRepository } = useRepos();
  const [movie, setMovie] = useState(state?.movie ?? null);
  const posterUrl = useMoviePoster(movie);
  const [isWatched, setIsWatched] = useState(movie?.watched ?? false);
  const [isImageReady, setIsImageReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (movie) return;

    movieRepository
      .getMovie(id)
      .then((res) => {
        setMovie(res);
        setIsWatched(res.watched);
      })
      .catch(setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnClick = () => {
    setIsWatched(!isWatched);
    movieRepository.updateMovie(movie.id, { watched: !isWatched });
  };

  if (error) throw error;

  if (!movie) {
    return <p>Cargando...</p>;
  }

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
        {posterUrl && (
          <img
            src={posterUrl}
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
