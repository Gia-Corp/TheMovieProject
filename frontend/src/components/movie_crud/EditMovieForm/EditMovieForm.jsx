import SubmitButton from "@/components/SubmitButton/SubmitButton";

function EditMovieForm() {
  return (
    <form action="">
      <label htmlFor="title">
        <p>Título</p>
        <input
          type="text"
          maxLength="200"
          name="title"
          id="title"
          placeholder="Devil Wears Prada"
          // value={inputText}
          // onChange={handleInputChange}
          // onFocus={handleOnFocus}
          // onBlur={handleOnBlur}
          required
        />
      </label>
      <SubmitButton text="Confirmar" /*isLoading={isPending}*/ />
    </form>
  );
}

export default EditMovieForm;
