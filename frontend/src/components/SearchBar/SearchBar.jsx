import "./SearchBar.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";

function SearchBar({ placeholder, searchCall }) {
  const timerRef = useRef(null);
  const blurTimeout = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (inputText === "") return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      searchCall(inputText)
        .then((results) => setResults(results))
        .catch(() => setResults([]));
    }, 500);
  }, [inputText, searchCall]);

  const handleInputChange = (event) => {
    const newInputText = event.target.value;
    setInputText(newInputText);
    if (newInputText === "") setResults(null);
  };

  const handleOnFocus = () => {
    clearTimeout(blurTimeout.current);
    setIsFocused(true);
  };

  const handleOnBlur = () => {
    blurTimeout.current = setTimeout(() => setIsFocused(false), 150);
  };

  const navigate = useNavigate();

  const handleClick = (movie) => {
    navigate(`/movies/${movie.id}`, {
      state: { movie },
      id: movie.id,
    });
  };

  return (
    <div className="search-bar">
      <input
        placeholder={placeholder}
        id="search-input"
        type="search"
        autoComplete="off"
        value={inputText}
        onChange={handleInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
      />
      {isFocused ? (
        results ? (
          <ul className="search-results">
            {results.length > 0
              ? results.map((movie) => {
                  return (
                    <li
                      onClick={() => handleClick(movie)}
                      className="search-item"
                      key={movie.id}
                    >
                      <p>{`${movie.title} (${movie.year})`}</p>
                      {movie.watched ? <MovieWatchedIcon size={20} /> : null}
                    </li>
                  );
                })
              : "No hay resultados"}
          </ul>
        ) : null
      ) : null}
    </div>
  );
}

export default SearchBar;
