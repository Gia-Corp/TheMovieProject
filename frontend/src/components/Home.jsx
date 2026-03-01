import { useEffect, useState } from "react";
import { useRepos } from "../hooks/useRepos.js";
import List from "./List/List.jsx";
import Paginator from "./Paginator/Paginator.jsx";

function Home() {
  const { movieRepository } = useRepos();
  const [list, setList] = useState([]);
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
          setList(res.movies);
          setTotalPageCount(res.metadata.page_count);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setError(true);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [currentPage, movieRepository]);

  const onPageSelection = (pageNumber) => {
    setCurrentPage(pageNumber);
    setIsLoading(true);
  };

  return (
    <div className="primary-content">
      <Paginator
        pageCount={totalPageCount}
        pageNumber={currentPage}
        disabled={isLoading}
        selectPageEvent={onPageSelection}
      />
      <main>
        {error ? <h3>ERROR</h3> : <List isLoading={isLoading} list={list} />}
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
