import { useContext, useEffect, useState } from "react";
import List from "./List/List.jsx";
import Paginator from "./Paginator/Paginator.jsx";
import { MovieServiceContext } from "./MovieServiceProvider";

function Home() {
  const movieService = useContext(MovieServiceContext);
  const [list, setList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);

  useEffect(() => {
    setError(false);
    setLoading(true);

    movieService
      .getList({
        page: currentPage,
        size: 10,
      })
      .then((res) => {
        if (res !== null) {
          setList(res.movies);
          setTotalPageCount(res.metadata.page_count);
          setLoading(false);
        } else {
          setLoading(false);
          setError(true);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [currentPage, movieService]);

  return (
    <div className="primary-content">
      <Paginator
        pageCount={totalPageCount}
        pageNumber={currentPage}
        disabled={loading}
        selectPageEvent={(pageNumber) => setCurrentPage(pageNumber)}
      />
      <main>
        {loading ? (
          <h3>cargando</h3>
        ) : error ? (
          <h3>ERROR</h3>
        ) : (
          <List list={list} />
        )}
      </main>
      <Paginator
        pageCount={totalPageCount}
        pageNumber={currentPage}
        disabled={loading}
        selectPageEvent={(pageNumber) => setCurrentPage(pageNumber)}
      />
    </div>
  );
}

export default Home;
