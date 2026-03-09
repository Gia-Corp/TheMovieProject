import "./SearchResults.css";
import SearchItem from "../SearchItem/SearchItem";

function SearchResults({ movies }) {
  if (movies.length === 0) {
    return;
  }

  return (
    <ul className="search-results">
      {movies.map((movie) => (
        <SearchItem key={movie["id"]} movie={movie} />
      ))}
    </ul>
  );
}

export default SearchResults;
