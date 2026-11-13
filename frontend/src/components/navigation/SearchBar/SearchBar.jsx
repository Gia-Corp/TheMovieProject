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

  useEffect(() => {
    if (inputText === "") return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      searchCall(inputText, controller.signal)
        .then((results) => setResults(results))
        .catch((error) => {
          if (!isAbortError(error)) setResults([]);
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
        id={name}
        name={name}
        type="search"
        autoComplete="off"
        value={inputText}
        onChange={handleInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        required={required}
      />
      {isFocused ? (
        results ? (
          <ul
            className="search-results"
            onMouseDown={(e) => e.preventDefault()}
          >
            {results.length > 0 ? (
              results.map((item) => {
                return (
                  <li
                    onMouseDown={() => onItemClick(item)}
                    className="search-item"
                    key={item.id}
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
