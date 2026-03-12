import "./SearchItem.css";
import { useNavigate } from "react-router-dom";
import MovieWatchedIcon from "../MovieWatchedIcon/MovieWatchedIcon";

function SearchItem({ movie }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movies/${movie.id}`, {
      state: { movie, moviePosterUrl: null },
      id: movie.id,
    });
  };

  return (
    <li onClick={handleClick} className="search-item" key={movie["id"]}>
      <p>{`${movie["title"]} (${movie["year"]})`}</p>
      {movie["watched"] ? <MovieWatchedIcon size={20} /> : null}
    </li>
  );
}

export default SearchItem;
