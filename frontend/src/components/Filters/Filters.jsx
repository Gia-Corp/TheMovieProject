import "./Filters.css";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 500;

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
  "War",
  "Western",
];

function useDebouncedField(value, onCommit) {
  const [inputValue, setInputValue] = useState(value);
  const timer = useRef(null);
  const committedValue = useRef(value);

  useEffect(() => {
    if (value !== committedValue.current) {
      committedValue.current = value;
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      committedValue.current = nextValue;
      onCommit(nextValue);
    }, DEBOUNCE_MS);
  };

  return [inputValue, handleChange];
}

function Filters({ filters, onChange }) {
  const [titleInput, handleTitleChange] = useDebouncedField(
    filters.title,
    (value) => onChange("title", value),
  );
  const [directorInput, handleDirectorChange] = useDebouncedField(
    filters.director,
    (value) => onChange("director", value),
  );
  const [yearInput, handleYearChange] = useDebouncedField(
    filters.year,
    (value) => onChange("year", value),
  );

  return (
    <div className="filters">
      <label className="filters-field">
        <span>Título</span>
        <input
          type="text"
          name="title"
          autoComplete="off"
          placeholder="Todos"
          value={titleInput}
          onChange={handleTitleChange}
        />
      </label>
      <label className="filters-field">
        <span>Director</span>
        <input
          type="text"
          name="director"
          autoComplete="off"
          placeholder="Todos"
          value={directorInput}
          onChange={handleDirectorChange}
        />
      </label>
      <label className="filters-field">
        <span>Género</span>
        <select
          name="genre"
          value={filters.genre}
          onChange={(event) => onChange("genre", event.target.value)}
        >
          <option value="">Todos</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>
      <label className="filters-field">
        <span>Año</span>
        <input
          type="number"
          name="year"
          min="0"
          placeholder="Todos"
          value={yearInput}
          onChange={handleYearChange}
        />
      </label>
    </div>
  );
}

export default Filters;
