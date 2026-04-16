import "./Home.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRepos } from "@/hooks/useRepos.js";
import MoviesGrid from "@/components/MoviesGrid/MoviesGrid";
import Paginator from "@/components/Paginator/Paginator";

function Home() {
  const { movieRepo } = useRepos();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [totalPages, setTotalPages] = useState(0);
  const MOVIES_PAGE_SIZE = 14;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    movieRepo
      .getMovies({
        page: currentPage,
        size: MOVIES_PAGE_SIZE,
      })
      .then((res) => {
        setMovies(res.movies);
        setTotalPages(res.metadata.page_count);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [currentPage, movieRepo]);

  const handlePageSelection = (pageNumber) =>
    setSearchParams({ page: pageNumber });

  if (error) throw error;

  return (
    <div className="home">
      <main>
        <MoviesGrid
          isLoading={isLoading}
          movies={movies}
          maxMovies={MOVIES_PAGE_SIZE}
        />
      </main>
      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={isLoading}
        handlePageSelection={handlePageSelection}
      />
    </div>
  );
}

export default Home;
