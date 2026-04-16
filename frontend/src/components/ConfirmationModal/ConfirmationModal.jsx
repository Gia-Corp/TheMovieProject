import "./ConfirmationModal.css";

function ConfirmationModal({
  title,
  ref,
  rejectText,
  onReject,
  confirmText,
  onConfirm,
  children,
}) {
  return (
    <dialog className="modal confirmation-modal" ref={ref}>
      <h3>{title}</h3>
      <div>
        <button onClick={() => onReject()}>{rejectText}</button>
        <button onClick={() => onConfirm()}>{confirmText}</button>
      </div>
      {children}
    </dialog>
  );
}

export default ConfirmationModal;
