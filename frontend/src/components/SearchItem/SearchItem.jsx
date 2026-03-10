import "./SearchItem.css";
import { Link } from "react-router-dom";

function SearchItem({ movie }) {
  return (
    <li className="search-item" key={movie["id"]}>
      <Link to={`/movies/${movie["id"]}`}>
        {`${movie["title"]} (${movie["year"]})`}
      </Link>
    </li>
  );
}

export default SearchItem;
