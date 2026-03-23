import "./MovieDetail.css";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useMoviePoster } from "@/hooks/useMoviePoster";
import { useRepos } from "@/hooks/useRepos";
import MovieWatchedButton from "@/components/MovieWatchedButton/MovieWatchedButton";

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
    movieRepository
      .updateMovie(movie.id, { watched: !isWatched })
      .catch(() => setIsWatched(isWatched));
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
        <span>
          <p>{movie.year}</p>
        </span>
        <MovieWatchedButton isWatched={isWatched} onClick={handleOnClick} />
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
