import { useEffect, useState } from "react";
import List from "./List/List.jsx";
import Paginator from "./Paginator/Paginator.jsx";
import { useRepos } from "../providers/RepositoriesProvider.jsx";

function Home() {
  const { movieRepository } = useRepos();
  const [list, setList] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);

  useEffect(() => {
    setError(false);
    setIsLoading(true);

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

  return (
    <div className="primary-content">
      <Paginator
        pageCount={totalPageCount}
        pageNumber={currentPage}
        disabled={isLoading}
        selectPageEvent={(pageNumber) => setCurrentPage(pageNumber)}
      />
      <main>
        {error ? <h3>ERROR</h3> : <List isLoading={isLoading} list={list} />}
      </main>
      <Paginator
        pageCount={totalPageCount}
        pageNumber={currentPage}
        disabled={isLoading}
        selectPageEvent={(pageNumber) => setCurrentPage(pageNumber)}
      />
    </div>
  );
}

export default Home;
