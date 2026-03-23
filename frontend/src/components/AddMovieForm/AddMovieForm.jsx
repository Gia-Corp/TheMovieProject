import "./AddMovieForm.css";
import { useActionState, useEffect } from "react";
import { useRepos } from "@/hooks/useRepos";

function AddMovieForm({ onSuccess }) {
  const { movieRepository } = useRepos();

  const [state, dispatch, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        const newMovie = {
          title: formData.get("title"),
          director: formData.get("director"),
          year: formData.get("year"),
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

  return (
    <form key={state.successCount} className="add-movie-form" action={dispatch}>
      <label htmlFor="title">Título</label>
      <input
        type="text"
        maxLength="100"
        name="title"
        id="title"
        placeholder="Apocalypse Now"
        required
      />

      <label htmlFor="director">Director/es</label>
      <input
        type="text"
        maxLength="100"
        name="director"
        id="director"
        placeholder="Francis Ford Coppola"
        required
      />

      <label htmlFor="year">Año</label>
      <input
        type="number"
        min="0"
        name="year"
        id="year"
        placeholder="1979"
        required
      />

      <label htmlFor="watched">
        <p>Ya la vimos</p>
        <input type="checkbox" name="watched" id="watched" required />
      </label>

      {state.error && <p className="error">{state.error}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Cargando..." : "Confirmar"}
      </button>
    </form>
  );
}

export default AddMovieForm;
