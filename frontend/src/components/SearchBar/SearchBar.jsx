import "./SearchBar.css";
import { useState, useEffect, useRef } from "react";
import { useRepos } from "@/hooks/useRepos";
import SearchResults from "@/components/SearchResults/SearchResults";

function SearchBar() {
  const { movieRepository } = useRepos();
  const timerRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [movies, setMovies] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeout = useRef(null);

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
        .then((res) => setMovies(res.movies))
        .catch(() => setMovies([]));
    }, 500);
  }, [inputText, movieRepository]);

  const handleInputChange = (event) => {
    const newInputText = event.target.value;
    setInputText(newInputText);
    if (newInputText === "") setMovies(null);
  };

  const handleOnFocus = () => {
    clearTimeout(blurTimeout.current);
    setIsFocused(true);
  };

  const handleOnBlur = () => {
    blurTimeout.current = setTimeout(() => setIsFocused(false), 150);
  };

  return (
    <div className="search-bar">
      <input
        id="search-input"
        placeholder="¿Qué peli buscás?"
        type="search"
        autoComplete="off"
        value={inputText}
        onChange={handleInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
      />
      {isFocused ? <SearchResults movies={movies} /> : ""}
    </div>
  );
}

export default SearchBar;
