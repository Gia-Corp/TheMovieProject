import "./SearchBar.css";
import { useState, useEffect, useRef } from "react";
import SearchItem from "@/components/SearchItem/SearchItem";

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
              ? results.map((item) => <SearchItem key={item.id} movie={item} />)
              : "No hay resultados"}
          </ul>
        ) : null
      ) : null}
    </div>
  );
}

export default SearchBar;
