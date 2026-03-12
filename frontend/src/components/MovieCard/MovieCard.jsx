import "./MovieCard.css";
import { useEffect, useState } from "react";
import { useRepos } from "../../hooks/useRepos";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
  const { posterRepository } = useRepos();
  const [moviePosterUrl, setMoviePosterUrl] = useState("");
  const navigate = useNavigate();
  const [isPosterReady, setIsPosterReady] = useState(false);

  useEffect(() => {
    posterRepository
      .getPoster({
        name: movie.title,
        year: movie.year,
      })
      .then((res) => {
        if (res === null) {
          return;
        }
        setMoviePosterUrl(res);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [movie, posterRepository]);

  const handleClick = () => {
    navigate(`/movies/${movie.id}`, { state: { movie, moviePosterUrl } });
  };

  return (
    <div className={isPosterReady ? "movie-card" : "movie-card skeleton"}>
      <img
        onClick={handleClick}
        src={moviePosterUrl}
        style={{ display: isPosterReady ? "block" : "none" }}
        onLoad={() => setIsPosterReady(true)}
        onError={() => setIsPosterReady(true)}
      />

      {movie["watched"] ? <div className="watched-movie"></div> : <></>}
    </div>
  );
}

export default MovieCard;
