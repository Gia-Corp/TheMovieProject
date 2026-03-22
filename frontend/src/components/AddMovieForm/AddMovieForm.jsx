import "./AddMovieForm.css";

function AddMovieForm() {
  return (
    <form className="add-movie-form">
      <input type="text" placeholder="titulo" />
      <input type="text" placeholder="director" />
      <input type="text" placeholder="año" />
      <button disabled>Enviar</button>
    </form>
  );
}

export default AddMovieForm;
