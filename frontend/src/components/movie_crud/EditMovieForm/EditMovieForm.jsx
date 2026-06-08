import SubmitButton from "@/components/SubmitButton/SubmitButton";

function EditMovieForm() {
  return (
    <form className="modal-form" /*action={dispatch}*/>
      <label htmlFor="title">
        <p>Título</p>
        <input
          type="text"
          maxLength="200"
          name="title"
          id="title"
          defaultValue="Devil Wears Prada"
        />
      </label>
      <label htmlFor="director">
        <p>Director/es</p>
        <input
          type="text"
          maxLength="200"
          name="director"
          id="director"
          defaultValue="David Frankel"
        />
      </label>
      <label htmlFor="year">
        <p>Año</p>
        <input
          type="number"
          min="1"
          name="year"
          id="year"
          defaultValue="2006"
        />
      </label>
      <label htmlFor="runtime">
        <p>Duración (en minutos)</p>
        <input
          type="number"
          min="1"
          name="runtime"
          id="runtime"
          defaultValue="109"
        />
      </label>
      <label htmlFor="plot">
        <p>Sinopsis</p>
        <input
          type="text"
          maxLength="500"
          name="plot"
          id="plot"
          defaultValue="Andy, a smart but sensible young journalist, starts working as an assistant to the cynical high fashion magazine editor Miranda Priestly."
        />
      </label>
      <SubmitButton text="Confirmar" /*isLoading={isPending}*/ />
    </form>
  );
}

export default EditMovieForm;
