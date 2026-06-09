import { useActionState, useEffect } from "react";
// import { useRepos } from "@/hooks/useRepos";
// import { useAuth } from "@/hooks/useAuth";
import SubmitButton from "@/components/SubmitButton/SubmitButton";

function EditMovieForm({ movie, onSuccess }) {
  // const { movieRepo } = useRepos();
  // const { accessToken } = useAuth();

  const [state, dispatch, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        const movieToEdit = Object.fromEntries(
          [...formData].filter(([, valor]) => valor?.toString().trim() !== ""),
        );
        if (Object.keys(movieToEdit).length === 0)
          return { error: null, successCount: prevState.successCount + 1 };

        console.log(movieToEdit);
        // const createdMovie = await movieRepo.createMovie(newMovie, accessToken);
        // setSelectedMovie(createdMovie);
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
    <form key={state.successCount} className="modal-form" action={dispatch}>
      <label htmlFor="title">
        <p>Título</p>
        <input
          type="text"
          maxLength="200"
          name="title"
          id="title"
          placeholder={movie.title}
        />
      </label>

      <label htmlFor="director">
        <p>Director/es</p>
        <input
          type="text"
          maxLength="200"
          name="director"
          id="director"
          placeholder={movie.director}
        />
      </label>

      <label htmlFor="year">
        <p>Año</p>
        <input
          type="number"
          min="1"
          name="year"
          id="year"
          placeholder={movie.year}
        />
      </label>

      <label htmlFor="runtime">
        <p>Duración (en minutos)</p>
        <input
          type="number"
          min="1"
          name="runtime"
          id="runtime"
          placeholder={movie.runtime.substring(0, movie.runtime.length - 4)}
        />
      </label>

      <label htmlFor="plot">
        <p>Sinopsis</p>
        <textarea
          maxLength="500"
          name="plot"
          id="plot"
          rows="5"
          cols="70"
          placeholder={movie.plot}
        />
      </label>

      {state.error && <p className="error-sign">{state.error}</p>}

      <SubmitButton text="Confirmar" isLoading={isPending} />
    </form>
  );
}

export default EditMovieForm;
