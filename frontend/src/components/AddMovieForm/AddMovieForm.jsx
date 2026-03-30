import "./AddMovieForm.css";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRepos } from "@/hooks/useRepos";

function AddMovieForm({ onSuccess }) {
  const { movieRepository, externalMovieRepository } = useRepos();
  const [inputText, setInputText] = useState("");
  const [movies, setMovies] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const timerRef = useRef(null);
  const blurTimeout = useRef(null);

  const [state, dispatch, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        const newMovie = {
          title: selectedMovie.Title,
          year: selectedMovie.Year,
          watched: formData.get("watched") ? true : false,
        };
        await movieRepository.createMovie(newMovie);
        return { error: null, successCount: prevState.successCount + 1 };
      } catch (error) {
        return { error: error.message, successCount: prevState.successCount };
      }
    },
    { error: null, successCount: 0 },
  );

  useEffect(() => {
    if (state.successCount > 0) onSuccess();
  }, [state.successCount, onSuccess]);

  useEffect(() => {
    if (inputText === "") return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      externalMovieRepository
        .getMovies({
          title: inputText,
        })
        .then((res) => setMovies(res.Search))
        .catch(() => setMovies([]));
    }, 500);
  }, [inputText, externalMovieRepository]);

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
  const handleSelect = (movie) => {
    setSelectedMovie(movie);
    setInputText(movie.Title);
    setIsFocused(false);
  };

  return (
    <form key={state.successCount} className="add-movie-form" action={dispatch}>
      <label htmlFor="title">
        <p>Título</p>
        <input
          type="search"
          maxLength="200"
          name="title"
          id="title"
          placeholder="Apocalypse Now"
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          required
        />
      </label>

      {isFocused && movies ? (
        <ul id="movie-results" onMouseDown={(e) => e.preventDefault()}>
          {movies.length > 0 ? (
            movies.map((movie) => (
              <li onMouseDown={() => handleSelect(movie)} key={movie.imdbID}>
                <img src={movie.Poster} />
                <div>
                  <span>{movie.Title}</span>
                  <p>{movie.Year}</p>
                </div>
              </li>
            ))
          ) : (
            <li>No se encontraron pelis</li>
          )}
        </ul>
      ) : null}

      <label htmlFor="watched">
        <p>Ya la vimos</p>
        <input type="checkbox" name="watched" id="watched" />
      </label>

      {state.error && <p className="error">{state.error}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Cargando..." : "Confirmar"}
      </button>
    </form>
  );
}

export default AddMovieForm;
