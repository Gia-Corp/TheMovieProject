import "./MovieCard.css";
import { useEffect, useState } from "react";
import { useRepos } from "../../hooks/useRepos";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  const { posterRepository } = useRepos();
  const [moviePosterUrl, setMoviePosterUrl] = useState("");

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

  return (
    <Link to={`/movies/${movie["id"]}`}>
      <div
        className="movie-card"
        style={
          moviePosterUrl
            ? {
                backgroundImage: `url(${moviePosterUrl})`,
              }
            : {}
        }
      >
        <div className="movie-info">
          <h2 className="movie-title">{movie["title"]}</h2>
          <p>{movie["director"]}</p>
          <p>{movie["year"]}</p>
        </div>
        {movie["watched"] ? <div className="watched-movie"></div> : <></>}
      </div>
    </Link>
  );
}

export default MovieCard;
