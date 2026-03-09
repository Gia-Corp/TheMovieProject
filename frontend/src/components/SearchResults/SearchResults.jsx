import "./SearchResults.css";

function SearchResults({ movies }) {
  return movies.length > 0 ? (
    <ul className="dropdown-list">
      {movies.map((movie) => {
        return (
          <li
            className="dropdown-item"
            key={movie["id"]}
          >{`${movie["title"]} (${movie["year"]})`}</li>
        );
      })}
    </ul>
  ) : (
    ""
  );
}

export default SearchResults;
