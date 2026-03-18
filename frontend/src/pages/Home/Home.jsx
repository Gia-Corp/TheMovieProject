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
  const [totalPageCount, setTotalPageCount] = useState(0);

  useEffect(() => {
    movieRepository
      .getMovies({
        page: currentPage,
        size: 10,
      })
      .then((res) => {
        if (res !== null) {
          setMovies(res.movies);
          setTotalPageCount(res.metadata.page_count);
          setIsLoading(false);
        }
      })
      .catch(setError);
  }, [currentPage, movieRepository]);

  const onPageSelection = (pageNumber) => {
    setCurrentPage(pageNumber);
    setIsLoading(true);
  };

  if (error) throw error;

  return (
    <div className="home">
      <Paginator
        pageCount={totalPageCount}
        pageNumber={currentPage}
        disabled={isLoading}
        selectPageEvent={onPageSelection}
      />
      <main>
        <MoviesList isLoading={isLoading} movies={movies} />
      </main>
      <Paginator
        pageCount={totalPageCount}
        pageNumber={currentPage}
        disabled={isLoading}
        selectPageEvent={onPageSelection}
      />
    </div>
  );
}

export default Home;
