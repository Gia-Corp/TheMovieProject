import { useRef, useState } from "react";
import Modal from "@/components/modals/Modal/Modal";
import EditMovieForm from "@/components/movie_crud/EditMovieForm/EditMovieForm";

function EditMovieButton({ movie }) {
  const formModalRef = useRef(null);
  const [formKey, setFormKey] = useState(0);

  const handleOpen = () => formModalRef.current.showModal();
  const handleClose = () => {
    formModalRef.current.close();
    setFormKey((prev) => prev + 1);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="icon-text-box utility-box edit-button"
      >
        <svg viewBox="0 0 24 24">
          <path d="m13.5 7.5l3 3M4 20v-3.5L15.293 5.207a1 1 0 0 1 1.414 0l2.086 2.086a1 1 0 0 1 0 1.414L7.5 20H4z" />
        </svg>
        <p>Editar</p>
      </button>

      <Modal title="Editar peli" ref={formModalRef} onClose={handleClose}>
        <EditMovieForm key={formKey} movie={movie} onSuccess={handleClose} />
      </Modal>
    </>
  );
}

export default EditMovieButton;
