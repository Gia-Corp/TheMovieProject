import "./SearchItem.css";
import { useNavigate } from "react-router-dom";

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
      {`${movie["title"]} (${movie["year"]})`}
    </li>
  );
}

export default SearchItem;
