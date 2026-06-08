import SubmitButton from "@/components/SubmitButton/SubmitButton";

function EditMovieForm({ movie }) {
  return (
    <form className="modal-form" /*action={dispatch}*/>
      <label htmlFor="title">
        <p>Título</p>
        <input
          type="text"
          maxLength="200"
          name="title"
          id="title"
          defaultValue={movie.title}
        />
      </label>
      <label htmlFor="director">
        <p>Director/es</p>
        <input
          type="text"
          maxLength="200"
          name="director"
          id="director"
          defaultValue={movie.director}
        />
      </label>
      <label htmlFor="year">
        <p>Año</p>
        <input
          type="number"
          min="1"
          name="year"
          id="year"
          defaultValue={movie.year}
        />
      </label>
      <label htmlFor="runtime">
        <p>Duración (en minutos)</p>
        <input
          type="number"
          min="1"
          name="runtime"
          id="runtime"
          defaultValue={movie.runtime.substring(0, movie.runtime.length - 4)}
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
          defaultValue={movie.plot}
        />
      </label>
      <SubmitButton text="Confirmar" /*isLoading={isPending}*/ />
    </form>
  );
}

export default EditMovieForm;
