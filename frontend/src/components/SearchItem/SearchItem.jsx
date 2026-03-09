import "./SearchItem.css";

function SearchItem({ movie }) {
  return (
    <li className="search-item" key={movie["id"]}>
      {`${movie["title"]} (${movie["year"]})`}
    </li>
  );
}

export default SearchItem;
