import { useRef, useState } from "react";
import AddMovieForm from "@/components/movie_crud/AddMovieForm/AddMovieForm";
import Modal from "@/components/modals/Modal/Modal";
import { useNotification } from "@/hooks/useNotification";

function AddMovieButton({ disabled }) {
  const formModalRef = useRef(null);
  const [formKey, setFormKey] = useState(0);
  const { notify } = useNotification();

  const handleOpen = () => formModalRef.current.showModal();
  const handleClose = (newMovie) => {
    formModalRef.current.close();
    setFormKey((prev) => prev + 1);
    if (newMovie) {
      notify(`"${newMovie.title}" agregada exitosamente!`);
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
    </>
  );
}

export default AddMovieButton;
