import "./WatchedMovies.css";
import "@/components/MovieCardSkeleton/MovieCardSkeleton.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRepos } from "@/hooks/useRepos";
import { isAbortError } from "@/apiFetch";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

function formatWatchedAt(value) {
  return new Date(value.replace(" ", "T")).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scrollToTop() {
  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

function WatchedMovieRow({ movie, isLast }) {
  const [isImageReady, setIsImageReady] = useState(!movie.poster_url);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <li
      className={`watched-movie-row${isLast ? " watched-movie-row--last" : ""}`}
    >
      <div className="watched-movie-poster">
        {movie.poster_url && !imageFailed ? (
          <>
            {!isImageReady && <div className="skeleton" />}
            <img
              src={movie.poster_url}
              alt={movie.title}
              style={{ display: isImageReady ? "block" : "none" }}
              onLoad={() => setIsImageReady(true)}
              onError={() => {
                setIsImageReady(true);
                setImageFailed(true);
              }}
            />
          </>
        ) : (
          <span className="watched-movie-poster-fallback">{movie.title}</span>
        )}
      </div>
      <Link to={`/movies/${movie.movie_id}`} className="watched-movie-title">
        {movie.title} <span className="watched-movie-year">({movie.year})</span>
      </Link>
      <span className="watched-movie-date">
        Vista el: {formatWatchedAt(movie.watched_at)}
      </span>
    </li>
  );
}

function WatchedMovies() {
  const { accessToken } = useAuth();
  const { userRepo } = useRepos();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    userRepo
      .getWatchedMovies(accessToken, controller.signal)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isAbortError(error)) setError(error);
      });

    return () => controller.abort();
  }, [accessToken, userRepo]);

  if (error) throw error;

  if (isLoading) {
    return (
      <div className="spinner-container">
        <SpinnerIcon />
      </div>
    );
  }

  const movies = data?.movies ?? [];
  const movieCount = data?.metadata?.movie_count ?? 0;
  const moviesWatched = data?.metadata?.movies_watched ?? 0;
  const percentage =
    movieCount > 0
      ? Math.min(100, Math.round((moviesWatched / movieCount) * 100))
      : 0;

  return (
    <div className="watched-movies-page">
      <h1>Pelis vistas</h1>

      <section className="watched-movies-stats" aria-label="Tu progreso">
        <p>
          <span className="watched-movies-count">
            {`${moviesWatched} de ${movieCount}`}
          </span>
          <span className="watched-movies-percentage">{`${percentage}%`}</span>
        </p>
        <div
          className="watched-movies-progress"
          role="progressbar"
          aria-label="Progreso de películas vistas"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="watched-movies-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </section>

      {movies.length === 0 ? (
        <p className="watched-movies-empty">Aún no has visto películas.</p>
      ) : (
        <ul role="list" className="watched-movies-list">
          {movies.map((movie, index) => (
            <WatchedMovieRow
              key={movie.movie_id}
              movie={movie}
              isLast={index === 0}
            />
          ))}
        </ul>
      )}

      {showScrollTop && (
        <button
          type="button"
          className="scroll-top"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default WatchedMovies;
