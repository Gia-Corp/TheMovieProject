import { useRef, useState } from "react";
import AddMovieForm from "@/components/AddMovieForm/AddMovieForm";
import Modal from "@/components/Modal/Modal";
import { useNavigate } from "react-router-dom";

function AddMovieButton({ disabled }) {
  const formModalRef = useRef(null);
  const [formKey, setFormKey] = useState(0);
  const [addedMovie, setAddedMovie] = useState(null);

  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/movies/${addedMovie.id}`, { state: { addedMovie } });
    setAddedMovie(null);
  };

  const handleOpen = () => formModalRef.current.showModal();
  const handleClose = (addedMovie) => {
    formModalRef.current.close();
    setFormKey((prev) => prev + 1);
    if (addedMovie) {
      setAddedMovie(addedMovie);
    }
  };

  return (
    <>
      <button
        disabled={disabled}
        onClick={handleOpen}
        className="primary-button button-with-icon"
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 19v-9a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm0 0l4.293-4.293a1 1 0 0 1 1.414 0L14 20M7 6V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1m-7-4v.01" />
        </svg>
        <p>Nueva peli</p>
      </button>

      <Modal
        title="Agregar nueva peli"
        ref={formModalRef}
        onClose={handleClose}
      >
        <AddMovieForm key={formKey} onSuccess={handleClose} />
      </Modal>

      {addedMovie ? (
        <dialog open className="notification">
          <h4>¡Peli agregada con éxito!</h4>
          <span>
            Ir a<button onClick={handleClick}>{addedMovie.title}</button>
          </span>
        </dialog>
      ) : null}
    </>
  );
}

export default AddMovieButton;
