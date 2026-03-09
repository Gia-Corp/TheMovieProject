import "./SearchResults.css";
import SearchItem from "../SearchItem/SearchItem";

function SearchResults({ movies }) {
  if (!movies) {
    return;
  }

  return (
    <ul className="search-results">
      {movies.length > 0
        ? movies.map((movie) => <SearchItem key={movie["id"]} movie={movie} />)
        : "No se encontraron pelis"}
    </ul>
  );
}

export default SearchResults;
