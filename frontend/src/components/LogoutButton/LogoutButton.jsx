import "./LogoutButton.css";
import { useRef } from "react";
import Modal from "@/components/Modal/Modal";

function LogoutButton() {
  const dialogRef = useRef(null);
  const handleOpen = () => dialogRef.current.showModal();
  const handleClose = () => dialogRef.current.close();

  return (
    <>
      <button onClick={handleOpen} className="logout-button">
        <p>Cerrar sesión</p>
      </button>

      <Modal
        title="¿Cerrar sesión, en serio?"
        ref={dialogRef}
        onClose={handleClose}
      >
        <div className="confirm-layout">
          <button className="logout-confirm-button">Sí, cerrar</button>
        </div>
      </Modal>
    </>
  );
}

export default LogoutButton;
