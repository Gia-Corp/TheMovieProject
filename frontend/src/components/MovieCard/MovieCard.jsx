import "./MovieCard.css";
import { useEffect, useState } from "react";
import { useRepos } from "../../hooks/useRepos";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
  const { posterRepository } = useRepos();
  const [moviePosterUrl, setMoviePosterUrl] = useState("");
  const navigate = useNavigate();

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
    navigate(`/movies/${movie.id}`, { state: { movie } });
  };

  return (
    <div
      onClick={handleClick}
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
        {/* <p>{movie["director"]}</p>
        <p>{movie["year"]}</p> */}
      </div>
      {movie["watched"] ? <div className="watched-movie"></div> : <></>}
    </div>
  );
}

export default MovieCard;
