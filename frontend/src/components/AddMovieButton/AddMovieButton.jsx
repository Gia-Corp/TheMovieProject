import "./AddMovieButton.css";
import { useRef } from "react";
import AddMovieForm from "@/components/AddMovieForm/AddMovieForm";
import Modal from "@/components/Modal/Modal";

function AddMovieButton() {
  const dialogRef = useRef(null);
  const handleOpen = () => dialogRef.current.showModal();
  const handleClose = () => dialogRef.current.close();

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

      <Modal title="Nueva peli" ref={dialogRef} onClose={handleClose}>
        <AddMovieForm />
      </Modal>
    </>
  );
}

export default AddMovieButton;
