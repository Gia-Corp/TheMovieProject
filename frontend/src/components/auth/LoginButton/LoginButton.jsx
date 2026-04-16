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
        <p>Iniciar sesión</p>
      </button>

      <Modal title="Iniciar sesión" ref={dialogRef} onClose={handleClose}>
        <LoginForm key={formKey} onSuccess={handleClose} />
      </Modal>
    </>
  );
}

export default LoginButton;
