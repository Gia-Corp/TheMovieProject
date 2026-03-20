import { useEffect, useState } from "react";
import { useRepos } from "../../hooks/useRepos.js";
import MoviesList from "../../components/MoviesList/MoviesList.jsx";
import Paginator from "../../components/Paginator/Paginator.jsx";
import "./Home.css";

function Home() {
  const { movieRepository } = useRepos();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const MOVIES_PAGE_SIZE = 10;

  useEffect(() => {
    movieRepository
      .getMovies({
        page: currentPage,
        size: MOVIES_PAGE_SIZE,
      })
      .then((res) => {
        setMovies(res.movies);
        setTotalPages(res.metadata.page_count);
        setIsLoading(false);
      })
      .catch(setError);
  }, [currentPage, movieRepository]);

  const handlePageSelection = (pageNumber) => {
    setCurrentPage(pageNumber);
    setIsLoading(true);
  };

  if (error) throw error;

  return (
    <div className="home">
      <Paginator
        key="upper-paginator"
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={isLoading}
        handlePageSelection={handlePageSelection}
      />
      <main>
        <MoviesList isLoading={isLoading} movies={movies} />
      </main>
      <Paginator
        key="bottom-paginator"
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={isLoading}
        handlePageSelection={handlePageSelection}
      />
    </div>
  );
}

export default Home;
