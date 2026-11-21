import "./SelectionFab.css";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";

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
          <MovieWatchedIcon size={26} color="var(--icon-clr)" />
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
