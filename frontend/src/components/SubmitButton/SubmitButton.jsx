import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

function SubmitButton({ text, isLoading }) {
  return (
    <button
      className="primary-button positive-button"
      type="submit"
      disabled={isLoading}
    >
      {isLoading ? <SpinnerIcon size={30} /> : text}
    </button>
  );
}

export default SubmitButton;
