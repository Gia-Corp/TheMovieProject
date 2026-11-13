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
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const blurTimeout = useRef(null);
  const abortRef = useRef(null);
  const itemRefs = useRef([]);
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
        .then((res) => {
          setResults(res);
          setActiveIndex(res?.length ? 0 : null);
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

  const handleContainerBlur = (event) => {
    const related = event.relatedTarget;
    if (related && containerRef.current?.contains(related)) return;
    blurTimeout.current = setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setActiveIndex(null);
      }
    }, 150);
  };

  const focusItem = (index) => {
    const el = itemRefs.current[index];
    if (el) el.focus();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!results?.length) return;
      setIsFocused(true);
      setActiveIndex(0);
      focusItem(0);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsFocused(false);
      setActiveIndex(null);
    }
  };

  const handleItemKeyDown = (index) => (event) => {
    if (!results?.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (index + 1) % results.length;
      setActiveIndex(next);
      focusItem(next);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = (index - 1 + results.length) % results.length;
      setActiveIndex(prev);
      focusItem(prev);
    } else if (event.key === "Enter") {
      event.preventDefault();
      onItemClick(results[index]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsFocused(false);
      setActiveIndex(null);
      const input = containerRef.current?.querySelector("input");
      input?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = results.length - 1;
      setActiveIndex(last);
      focusItem(last);
    }
  };

  return (
    <div className="search-bar" ref={containerRef} onBlur={handleContainerBlur}>
      <input
        placeholder={placeholder}
        id={name}
        name={name}
        type="search"
        autoComplete="off"
        value={inputText}
        onChange={handleInputChange}
        onFocus={handleOnFocus}
        onKeyDown={handleInputKeyDown}
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
              results.map((item, index) => {
                const optionId = `movie-search-results-option-${item.id}`;
                return (
                  <li
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    tabIndex={activeIndex === index ? 0 : -1}
                    onMouseDown={() => onItemClick(item)}
                    onKeyDown={handleItemKeyDown(index)}
                    onFocus={() => {
                      clearTimeout(blurTimeout.current);
                      setActiveIndex(index);
                    }}
                    className="search-item"
                    key={item.id}
                    id={optionId}
                    role="option"
                    aria-selected={activeIndex === index}
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
