import "./Home.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRepos } from "@/hooks/useRepos.js";
import { isAbortError } from "@/apiFetch";
import Filters from "@/components/Filters/Filters";
import MoviesGrid from "@/components/MoviesGrid/MoviesGrid";
import Paginator from "@/components/pagination/Paginator";
import PaginatorPrev from "@/components/pagination/PaginatorPrev";
import PaginatorNext from "@/components/pagination/PaginatorNext";

const MOVIES_PAGE_SIZE = 14;

function buildFiltersFromSearchParams(searchParams) {
  return {
    title: searchParams.get("title") ?? "",
    director: searchParams.get("director") ?? "",
    year: searchParams.get("year") ?? "",
    genre: searchParams.get("genre") ?? "",
  };
}

function Home() {
  const { movieRepo } = useRepos();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState(() =>
    buildFiltersFromSearchParams(searchParams),
  );

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

  if (error) throw error;

  return (
    <div className="home">
      <Filters filters={filters} onChange={handleFilterChange} />
      {!isLoading && noResults ? (
        <p className="no-results">
          No hay películas que coincidan con los filtros
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
  );
}

export default Home;
