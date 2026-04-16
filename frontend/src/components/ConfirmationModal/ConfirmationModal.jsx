import "./ConfirmationModal.css";
import SubmitButton from "@/components/SubmitButton/SubmitButton";

function ConfirmationModal({
  title,
  ref,
  rejectText,
  onReject,
  confirmText,
  onConfirm,
  isLoading,
  children,
}) {
  return (
    <dialog className="modal confirmation-modal" ref={ref}>
      <h3>{title}</h3>
      <div>
        <button onClick={() => onReject()}>{rejectText}</button>
        <SubmitButton
          text={confirmText}
          isLoading={isLoading}
          onClick={() => onConfirm()}
        />
      </div>
      {children}
    </dialog>
  );
}

export default ConfirmationModal;
