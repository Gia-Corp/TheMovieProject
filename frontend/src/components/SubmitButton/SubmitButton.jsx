import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

function SubmitButton({ text, isLoading, onClick }) {
  return (
    <button
      className="primary-button positive-button"
      type="submit"
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? <SpinnerIcon size={30} /> : text}
    </button>
  );
}

export default SubmitButton;
