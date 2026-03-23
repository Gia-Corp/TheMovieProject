import "./Modal.css";

function Modal({ title, ref, onClose, children }) {
  return (
    <dialog className="modal" ref={ref}>
      <header>
        <h2>{title}</h2>
        <button onClick={onClose}>
          <svg className="cancel-search-button" viewBox="0 -960 960 960">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
      </header>
      {children}
    </dialog>
  );
}

export default Modal;
