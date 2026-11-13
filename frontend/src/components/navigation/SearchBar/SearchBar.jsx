import "./SearchBar.css";
import { useState, useEffect, useRef } from "react";
import { isAbortError } from "@/apiFetch";

function SearchBar({
  name,
  required = false,
  placeholder,
  searchCall,
  renderItem,
  onItemClick,
}) {
  const timerRef = useRef(null);
  const blurTimeout = useRef(null);
  const abortRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (inputText === "") return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      searchCall(inputText, controller.signal)
        .then((results) => {
          setResults(results);
          setActiveIndex(null);
        })
        .catch((error) => {
          if (!isAbortError(error)) {
            setResults([]);
            setActiveIndex(null);
          }
        });
    }, 500);

    return () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [inputText, searchCall]);

  const handleInputChange = (event) => {
    const newInputText = event.target.value;
    setInputText(newInputText);
    setActiveIndex(null);
    if (newInputText === "") setResults(null);
  };

  const handleOnFocus = () => {
    clearTimeout(blurTimeout.current);
    setIsFocused(true);
  };

  const handleOnBlur = () => {
    blurTimeout.current = setTimeout(() => setIsFocused(false), 150);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!results?.length) return;
      setActiveIndex((prevIndex) =>
        prevIndex == null ? 0 : (prevIndex + 1) % results.length,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!results?.length) return;
      setActiveIndex((prevIndex) =>
        prevIndex == null
          ? results.length - 1
          : (prevIndex - 1 + results.length) % results.length,
      );
    } else if (event.key === "Enter") {
      if (activeIndex != null && results?.[activeIndex]) {
        event.preventDefault();
        onItemClick(results[activeIndex]);
      }
    }
  };

  return (
    <div className="search-bar">
      <input
        placeholder={placeholder}
        id={name}
        name={name}
        type="search"
        autoComplete="off"
        value={inputText}
        onChange={handleInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onKeyDown={handleKeyDown}
        required={required}
        aria-expanded={Boolean(isFocused && results)}
        aria-controls={
          isFocused && results ? "movie-search-results" : undefined
        }
        aria-activedescendant={
          activeIndex != null && results?.[activeIndex]
            ? `movie-search-results-option-${results[activeIndex].id}`
            : undefined
        }
      />
      {isFocused ? (
        results ? (
          <ul
            className="search-results"
            id="movie-search-results"
            role="listbox"
            onMouseDown={(e) => e.preventDefault()}
          >
            {results.length > 0 ? (
              results.map((item) => {
                const optionId = `movie-search-results-option-${item.id}`;
                return (
                  <li
                    onMouseDown={() => onItemClick(item)}
                    className="search-item"
                    key={item.id}
                    id={optionId}
                    role="option"
                    aria-selected={results[activeIndex]?.id === item.id}
                  >
                    {renderItem(item)}
                  </li>
                );
              })
            ) : (
              <li>No hay resultados</li>
            )}
          </ul>
        ) : null
      ) : null}
    </div>
  );
}

export default SearchBar;
