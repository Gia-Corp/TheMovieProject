import "./SearchResults.css";
import SearchItem from "@/components/SearchItem/SearchItem";

function SearchResults({ results }) {
  if (!results) {
    return;
  }

  return (
    <ul className="search-results">
      {results.length > 0
        ? results.map((item) => <SearchItem key={item.id} movie={item} />)
        : "No hay resultados"}
    </ul>
  );
}

export default SearchResults;
