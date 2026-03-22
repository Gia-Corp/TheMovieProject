import "./Modal.css";

function Modal({ title, ref, onClose, children }) {
  return (
    <dialog className="modal" ref={ref}>
      <header>
        <h2>{title}</h2>
        <button onClick={onClose}>X</button>
      </header>
      {children}
    </dialog>
  );
}

export default Modal;
