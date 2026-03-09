import "./SearchForm.css";
import { useState, useEffect, useRef } from "react";
import { useRepos } from "../../hooks/useRepos";
import SearchResults from "../SearchResults/SearchResults";

function SearchForm() {
  const [inputText, setInputText] = useState("");
  const timerRef = useRef(null);
  const { movieRepository } = useRepos();
  const [movies, setMovies] = useState(null);

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

  return (
    <form className="search-form">
      <input
        placeholder="Buscar peli..."
        type="text"
        value={inputText}
        onChange={handleInputChange}
      />
      <SearchResults movies={movies} />
    </form>
  );
}

export default SearchForm;
