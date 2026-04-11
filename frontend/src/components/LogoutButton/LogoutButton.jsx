import "./LogoutButton.css";
import { useRef } from "react";
import Modal from "@/components/Modal/Modal";
import { useAuth } from "@/hooks/useAuth";

function LogoutButton() {
  const dialogRef = useRef(null);
  const { setAccessToken } = useAuth();

  const handleOpen = () => dialogRef.current.showModal();
  const handleClose = () => dialogRef.current.close();
  function handleClick() {
    const LOGOUT_ENDPOINT = "/auth/logout";
    fetch(LOGOUT_ENDPOINT, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setAccessToken(null);
      handleClose();
    });
  }

  return (
    <>
      <button onClick={handleOpen} className="primary-button">
        <p>Cerrar sesión</p>
      </button>

      <Modal
        title="¿Cerrar sesión, en serio?"
        ref={dialogRef}
        onClose={handleClose}
      >
        <div className="confirm-layout">
          <button onClick={handleClick} className="negative-button">
            Sí, cerrar
          </button>
        </div>
      </Modal>
    </>
  );
}

export default LogoutButton;
