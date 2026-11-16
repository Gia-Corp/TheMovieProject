import { useRef, useState } from "react";
import Modal from "@/components/modals/Modal/Modal";
import LoginForm from "@/components/auth/LoginForm/LoginForm";

function LoginButton() {
  const dialogRef = useRef(null);
  const [formKey, setFormKey] = useState(0);

  const handleOpen = () => dialogRef.current.showModal();
  const handleClose = () => {
    dialogRef.current.close();
    setFormKey((prev) => prev + 1);
  };

  return (
    <>
      <button onClick={handleOpen} className="primary-button button-with-icon">
        <svg viewBox="0 0 24 24">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5l-5-5M15 12H3" />
        </svg>
        <p>Iniciar sesión</p>
      </button>

      <Modal title="Iniciar sesión" ref={dialogRef} onClose={handleClose}>
        <LoginForm key={formKey} onSuccess={handleClose} />
      </Modal>
    </>
  );
}

export default LoginButton;
