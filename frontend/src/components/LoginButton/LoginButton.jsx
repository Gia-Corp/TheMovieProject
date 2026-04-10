import "./LoginButton.css";
import { useRef } from "react";
import Modal from "@/components/Modal/Modal";
import LoginForm from "@/components/LoginForm/LoginForm";

function LoginButton() {
  const dialogRef = useRef(null);
  const handleOpen = () => dialogRef.current.showModal();
  const handleClose = () => dialogRef.current.close();

  return (
    <>
      <button onClick={handleOpen} className="login-button">
        <p>Iniciar sesión</p>
      </button>

      <Modal title="Iniciar sesión" ref={dialogRef} onClose={handleClose}>
        <LoginForm onSuccess={handleClose} />
      </Modal>
    </>
  );
}

export default LoginButton;
