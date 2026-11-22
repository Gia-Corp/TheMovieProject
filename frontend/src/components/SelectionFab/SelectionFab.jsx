import "./SelectionFab.css";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

function SelectionFab({ selectedCount, isLoading, onConfirm }) {
  const isSingle = selectedCount === 1;

  return (
    <button
      type="button"
      className="selection-fab"
      onClick={onConfirm}
      disabled={isLoading}
      aria-label={
        isSingle
          ? `Marcar ${selectedCount} película como vista`
          : `Marcar ${selectedCount} películas como vistas`
      }
    >
      {isLoading ? (
        <SpinnerIcon size={26} />
      ) : (
        <>
          <svg
            className="selection-fab-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span>
            {isSingle
              ? `Marcar ${selectedCount} como vista`
              : `Marcar ${selectedCount} como vistas`}
          </span>
        </>
      )}
    </button>
  );
}

export default SelectionFab;
