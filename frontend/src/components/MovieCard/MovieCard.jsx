import "./MovieCard.css";
import { useEffect, useState } from "react";
import { useRepos } from "../../providers/RepositoriesProvider";

function MovieCard({ item }) {
  const { posterRepository } = useRepos();
  const [moviePosterUrl, setMoviePosterUrl] = useState("");

  useEffect(() => {
    posterRepository
      .getPoster({
        name: item.title,
        year: item.year,
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
  }, [item, posterRepository]);

  return (
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
      {
        <div className="movie-info">
          <h2 className="titulo-pelicula">{item["title"]}</h2>
          <p className="director-pelicula">{item["director"]}</p>
          <p className="año-pelicula">{item["year"]}</p>
        </div>
      }
    </div>
  );
}

export default MovieCard;
