import "./CancelSearchButton.css";

function CancelSearchButton({ size = "100%", onClick }) {
  return (
    <svg
      className="cancel-search-button"
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      onClick={onClick}
    >
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

export default CancelSearchButton;
