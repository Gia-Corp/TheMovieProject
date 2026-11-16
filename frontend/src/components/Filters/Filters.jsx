import "./Filters.css";
import { useEffect, useRef } from "react";

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
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onCommit(nextValue);
    }, DEBOUNCE_MS);
  };

  return [inputRef, handleChange];
}

function Filters({ filters, onChange }) {
  const [titleRef, handleTitleChange] = useDebouncedField(
    filters.title,
    (value) => onChange("title", value),
  );
  const [directorRef, handleDirectorChange] = useDebouncedField(
    filters.director,
    (value) => onChange("director", value),
  );
  const [yearRef, handleYearChange] = useDebouncedField(filters.year, (value) =>
    onChange("year", value),
  );

  return (
    <div className="filters">
      <label className="filters-field">
        <span>Título</span>
        <input
          ref={titleRef}
          type="text"
          name="title"
          autoComplete="off"
          placeholder="Todos"
          defaultValue={filters.title}
          onChange={handleTitleChange}
        />
      </label>
      <label className="filters-field">
        <span>Director</span>
        <input
          ref={directorRef}
          type="text"
          name="director"
          autoComplete="off"
          placeholder="Todos"
          defaultValue={filters.director}
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
          ref={yearRef}
          type="number"
          name="year"
          min="0"
          placeholder="Todos"
          defaultValue={filters.year}
          onChange={handleYearChange}
        />
      </label>
    </div>
  );
}

export default Filters;
