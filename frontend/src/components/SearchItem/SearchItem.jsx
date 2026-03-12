import "./SearchItem.css";
import { useNavigate } from "react-router-dom";
import checkIcon from "../../assets/icons/check_circle.svg";

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
      {movie["watched"] ? <img src={checkIcon} className="check-icon" /> : ""}
    </li>
  );
}

export default SearchItem;
