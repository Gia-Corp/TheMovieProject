import "./Home.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRepos } from "@/hooks/useRepos.js";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { useSelection } from "@/hooks/useSelection";
import { clearRequestCache, isAbortError } from "@/apiFetch";
import Filters from "@/components/Filters/Filters";
import MoviesGrid from "@/components/MoviesGrid/MoviesGrid";
import Paginator from "@/components/pagination/Paginator";
import PaginatorPrev from "@/components/pagination/PaginatorPrev";
import PaginatorNext from "@/components/pagination/PaginatorNext";
import SelectionFab from "@/components/SelectionFab/SelectionFab";

const MOVIES_PAGE_SIZE = 14;
const WATCHED_MOVIES_BATCH_SIZE = 100;

function buildFiltersFromSearchParams(searchParams) {
  return {
    title: searchParams.get("title") ?? "",
    director: searchParams.get("director") ?? "",
    year: searchParams.get("year") ?? "",
    genre: searchParams.get("genre") ?? "",
  };
}

function Home() {
  const { movieRepo, userRepo } = useRepos();
  const { accessToken } = useAuth();
  const { notify } = useNotification();
  const {
    isSelectionMode,
    selectedIds,
    toggleSelectionMode,
    toggleSelection,
    clearSelection,
  } = useSelection();

  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isConfirming, setIsConfirming] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState(() =>
    buildFiltersFromSearchParams(searchParams),
  );

  const canUseSelectionMode = Boolean(accessToken);
  const isSelectionModeActive = canUseSelectionMode && isSelectionMode;

  // Mantener filters sincronizado con la URL al navegar (atrás/adelante)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => {
      const next = buildFiltersFromSearchParams(searchParams);
      if (
        prev.title !== next.title ||
        prev.director !== next.director ||
        prev.year !== next.year ||
        prev.genre !== next.genre
      ) {
        return next;
      }
      return prev;
    });
  }, [searchParams]);

  const hidePrevButton = currentPage === 1 || totalPages === 0;
  const hideNextButton = currentPage === totalPages || totalPages === 0;

  useEffect(() => {
    const controller = new AbortController();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    movieRepo
      .getMovies({
        page: currentPage,
        size: MOVIES_PAGE_SIZE,
        title: filters.title || undefined,
        director: filters.director || undefined,
        year: filters.year || undefined,
        genre: filters.genre || undefined,
        signal: controller.signal,
      })
      .then((res) => {
        setMovies(res.movies);
        setTotalPages(res.metadata.page_count);
        setNoResults(false);
      })
      .catch((error) => {
        if (isAbortError(error)) return;

        if (error.status === 404) {
          setMovies([]);
          setTotalPages(0);
          setNoResults(true);
          return;
        }

        setError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [
    currentPage,
    filters.title,
    filters.director,
    filters.year,
    filters.genre,
    movieRepo,
    refreshKey,
  ]);

  const handlePageSelection = (pageNumber) => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      nextParams.set("page", pageNumber);
      return nextParams;
    });
  };

  const handleFilterChange = (name, value) => {
    setNoResults(false);
    setFilters((prev) => ({ ...prev, [name]: value }));
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (value) {
        nextParams.set(name, value);
      } else {
        nextParams.delete(name);
      }
      nextParams.set("page", "1");
      return nextParams;
    });
  };

  const handleConfirmSelection = async () => {
    if (selectedIds.size === 0 || isConfirming) return;

    setIsConfirming(true);

    const items = Array.from(selectedIds, (movieId) => ({
      movie_id: movieId,
      watched: true,
    }));

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < items.length; i += WATCHED_MOVIES_BATCH_SIZE) {
        const batch = items.slice(i, i + WATCHED_MOVIES_BATCH_SIZE);
        const result = await userRepo.updateWatchedMovies(batch, accessToken);
        successCount += result.success.length;
        errorCount += result.errors.length;
      }

      clearRequestCache();
      setRefreshKey((key) => key + 1);

      if (errorCount > 0) {
        notify(
          successCount > 0
            ? `${successCount} marcadas como vistas y ${errorCount} con errores`
            : `No se pudo marcar ${errorCount === 1 ? "1 peli" : `${errorCount} pelis`}`,
        );
      } else {
        notify(
          successCount === 1
            ? "1 peli marcada como vista"
            : `${successCount} pelis marcadas como vistas`,
        );
      }

      clearSelection();
    } catch (error) {
      notify(`No se pudieron marcar las pelis: ${error.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  if (error) throw error;

  return (
    <>
      <div className="home">
        <Filters filters={filters} onChange={handleFilterChange} />
        {canUseSelectionMode && (
          <div className="selection-toolbar">
            <button
              type="button"
              className={`selection-mode-toggle${isSelectionModeActive ? " selection-mode-toggle--active" : ""}`}
              aria-pressed={isSelectionModeActive}
              onClick={toggleSelectionMode}
            >
              {!isSelectionModeActive && (
                <svg
                  className="selection-mode-toggle-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
              {isSelectionModeActive
                ? "Cancelar selección"
                : "Marcar pelis como vistas"}
            </button>
            {isSelectionModeActive && (
              <p className="selection-hint">
                Tocá las pelis que ya viste y después confirmá.
              </p>
            )}
          </div>
        )}
        {!isLoading && noResults ? (
          <p className="no-results">
            No hay pelis que coincidan con los filtros
          </p>
        ) : (
          <>
            <main>
              {hidePrevButton ? (
                <div />
              ) : (
                <PaginatorPrev
                  onClick={() => handlePageSelection(currentPage - 1)}
                />
              )}
              <MoviesGrid
                isLoading={isLoading}
                movies={movies}
                maxMovies={MOVIES_PAGE_SIZE}
                isSelectionMode={isSelectionModeActive}
                selectedIds={selectedIds}
                onToggleSelection={toggleSelection}
              />
              {hideNextButton ? (
                <div />
              ) : (
                <PaginatorNext
                  onClick={() => handlePageSelection(currentPage + 1)}
                />
              )}
            </main>
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              disabled={isLoading}
              handlePageSelection={handlePageSelection}
            />
          </>
        )}
      </div>
      {isSelectionModeActive && selectedIds.size > 0 && (
        <SelectionFab
          selectedCount={selectedIds.size}
          isLoading={isConfirming}
          onConfirm={handleConfirmSelection}
        />
      )}
    </>
  );
}

export default Home;
