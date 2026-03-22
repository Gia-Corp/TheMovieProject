import "./AddMovieButton.css";
import { useRef } from "react";

function AddMovieButton() {
  const dialogRef = useRef(null);
  const handleOpen = () => dialogRef.current.showModal();
  // const handleClose = () => dialogRef.current.close();

  return (
    <>
      <button onClick={handleOpen} className="add-movie-button">
        <svg width="23" height="23" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="#000000"
            strokeLinecap="round"
            strokeWidth="2"
            d="M12 19V5m7 7H5"
          />
        </svg>
        <p>Añadir peli</p>
      </button>

      <dialog
        style={{ "align-self": "center", "justify-self": "center" }}
        ref={dialogRef}
      >
        {/* <FormularioPelicula onClose={handleClose} /> */}
        <form style={{ display: "flex", "flex-direction": "column" }}>
          <h2>Titulo del form</h2>
          <input type="text" placeholder="titulo" />
          <input type="text" placeholder="director" />
          <input type="text" placeholder="año" />
          <button disabled>Enviar</button>
        </form>
      </dialog>
    </>
  );
}

export default AddMovieButton;
