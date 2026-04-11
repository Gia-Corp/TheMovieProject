import { useRef } from "react";
import AddMovieForm from "@/components/AddMovieForm/AddMovieForm";
import Modal from "@/components/Modal/Modal";

function AddMovieButton() {
  const dialogRef = useRef(null);
  const handleOpen = () => dialogRef.current.showModal();
  const handleClose = () => dialogRef.current.close();

  return (
    <>
      <button onClick={handleOpen} className="primary-button button-with-icon">
        <svg viewBox="0 0 24 24">
          <path d="M12 19V5m7 7H5" />
        </svg>
        <p>Nueva peli</p>
      </button>

      <Modal
        title="Agregar peli a la lista 📋"
        ref={dialogRef}
        onClose={handleClose}
      >
        <AddMovieForm onSuccess={handleClose} />
      </Modal>
    </>
  );
}

export default AddMovieButton;
