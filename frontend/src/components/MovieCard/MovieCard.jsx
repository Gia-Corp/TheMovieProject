import "./MovieCard.css";
import { useEffect, useState } from "react";
import { useRepos } from "../RepositoriesProvider";

function MovieCard({ item }) {
  const { posterRepository } = useRepos();

  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    posterRepository
      .getMovieData({
        name: item.title,
        year: item.year,
      })
      .then((res) => {
        if (res !== null) {
          setInfo(res);
          setLoading(false);
        } else {
          setLoading(false);
        }
        return;
      })
      .catch(() => {
        setLoading(false);
        return;
      });
  }, [item, posterRepository]);

  return (
    <div
      className="tarjeta-pelicula"
      style={
        info.poster_path
          ? {
              backgroundImage: `url(${import.meta.env.VITE_MOVIE_API_IMAGES_URL}${info.poster_path})`,
            }
          : {}
      }
    >
      {
        <div className="detalles-pelicula">
          <h2 className="titulo-pelicula">{item["title"]}</h2>
          <p className="director-pelicula">{item["director"]}</p>
          <p className="año-pelicula">{item["year"]}</p>
        </div>
      }
    </div>
  );
}

export default MovieCard;
