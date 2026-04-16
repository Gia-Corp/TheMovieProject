import "./LogoutButton.css";
import { useRef } from "react";
// import Modal from "@/components/Modal/Modal";
import { useAuth } from "@/hooks/useAuth";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";

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
      <button
        onClick={handleOpen}
        className="primary-button button-with-icon negative-button"
      >
        <svg viewBox="0 0 24 24">
          <path d="M20 12h-9.5m7.5 3l3-3l-3-3m-5-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-1" />
        </svg>
        <p>Cerrar sesión</p>
      </button>

      <ConfirmationModal
        title="¿Cerrar sesión, en serio?"
        ref={dialogRef}
        rejectText="No"
        onReject={handleClose}
        confirmText="Sí, cerrar"
        onConfirm={handleClick}
      />
    </>
  );
}

export default LogoutButton;
