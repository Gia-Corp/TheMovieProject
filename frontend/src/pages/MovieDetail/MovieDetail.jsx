import "./MovieDetail.css";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useRepos } from "@/hooks/useRepos";
import MovieWatchedButton from "@/components/MovieWatchedButton/MovieWatchedButton";
import { useAuth } from "@/hooks/useAuth";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";
import DeleteMovieButton from "@/components/DeleteMovieButton/DeleteMovieButton";

function MovieDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const { movieRepository } = useRepos();
  const [movie, setMovie] = useState(state?.movie ?? null);
  const [isWatched, setIsWatched] = useState(movie?.watched ?? false);
  const [isImageReady, setIsImageReady] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(!movie?.plot);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (movie?.plot) return;

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
      .updateMovie(movie.id, { watched: !isWatched }, accessToken)
      .catch(() => setIsWatched(isWatched));
  };

  if (error) throw error;

  if (isLoading) {
    return (
      <div className="spinner-container">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      <div className="detail-section">
        <h2>{movie.title}</h2>
        <p>{movie.plot}</p>
      </div>
      <div className="poster-section">
        <div>
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
          <div className="info-section">
            {movie.runtime !== null ? (
              <div className="icon-text-box">
                <svg viewBox="0 0 24 24">
                  <path d="M12 6.5V12l3.5 2m5.5-2a9 9 0 1 1-18 0a9 9 0 0 1 18 0z" />
                </svg>
                <p>{movie.runtime}</p>
              </div>
            ) : null}
            <div className="icon-text-box">
              <svg viewBox="0 0 24 24">
                <g fill="none" stroke="#000" strokeWidth="2">
                  <path
                    strokeLinejoin="round"
                    d="M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4H4z"
                  />
                  <path strokeLinecap="round" d="M8 6.5v-3m8 3v-3" />
                  <path
                    strokeLinejoin="round"
                    d="M4 10h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"
                  />
                </g>
              </svg>
              <p>{movie.year}</p>
            </div>
            {movie.director !== null ? (
              <div className="icon-text-box">
                <svg viewBox="0 0 24 24">
                  <path d="m6 21l12-9M6 12l12 9M5 12h14M6 3v9m12-9v9M6 8h12M6 5h12" />
                </svg>
                <p>{movie.director}</p>
              </div>
            ) : null}
            <div className="icon-text-box">
              <MovieWatchedButton
                isWatched={isWatched}
                onClick={handleOnClick}
                disabled={!accessToken}
              />
              <p>{isWatched ? "Vista" : "No vista aún"}</p>
            </div>
            {accessToken ? (
              <>
                <button className="icon-text-box utility-box edit-button">
                  <svg viewBox="0 0 24 24">
                    <path d="m13.5 7.5l3 3M4 20v-3.5L15.293 5.207a1 1 0 0 1 1.414 0l2.086 2.086a1 1 0 0 1 0 1.414L7.5 20H4z" />
                  </svg>
                  <p>Editar</p>
                </button>
                <DeleteMovieButton movieId={movie.id} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
