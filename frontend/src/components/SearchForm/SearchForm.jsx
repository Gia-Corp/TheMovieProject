import "./SearchForm.css";
import { useState, useEffect, useRef } from "react";
import { useRepos } from "../../hooks/useRepos";

function SearchForm() {
  const [inputText, setInputText] = useState("");
  const timerRef = useRef(null);
  const { movieRepository } = useRepos();
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    if (inputText === "") return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      movieRepository
        .getMovies({
          page: 1,
          size: 20,
          title: inputText,
        })
        .then((res) => setMovies(res["movies"]));
    }, 500);
  }, [inputText, movieRepository]);

  const handleInputChange = (event) => {
    const newInputText = event.target.value;
    setInputText(newInputText);
    if (newInputText === "") setMovies([]);
  };

  return (
    <form className="search-form">
      <input
        placeholder="Buscar peli..."
        type="text"
        value={inputText}
        onChange={handleInputChange}
      />
      {movies.length > 0 ? (
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
      )}
    </form>
  );
}

export default SearchForm;
