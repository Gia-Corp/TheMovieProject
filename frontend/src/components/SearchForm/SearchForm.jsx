import "./SearchForm.css";
import { useState, useEffect, useRef } from "react";
import { useRepos } from "../../hooks/useRepos";
import SearchResults from "../SearchResults/SearchResults";

function SearchForm() {
  const [inputText, setInputText] = useState("");
  const timerRef = useRef(null);
  const { movieRepository } = useRepos();
  const [movies, setMovies] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

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
        .then((res) => setMovies(res["movies"]))
        .catch(() => setMovies([]));
    }, 500);
  }, [inputText, movieRepository]);

  const handleInputChange = (event) => {
    const newInputText = event.target.value;
    setInputText(newInputText);
    if (newInputText === "") setMovies(null);
  };

  const handleOnFocus = () => setIsFocused(true);
  const handleOnBlur = () => setTimeout(() => setIsFocused(false), 150);

  return (
    <form className="search-form">
      <input
        placeholder="Buscar peli..."
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
      />
      {isFocused ? <SearchResults movies={movies} /> : ""}
    </form>
  );
}

export default SearchForm;
