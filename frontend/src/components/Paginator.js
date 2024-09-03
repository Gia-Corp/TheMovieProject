import { useEffect, useState } from "react";
import Pagination from "react-bootstrap/Pagination";

function Paginator({ selectPageEvent, pageNumber, pageCount, disabled }) {
  const [currentPage, setCurrentPage] = useState(pageNumber);
  const maxVisiblePages = 5;

  useEffect(() => setCurrentPage(pageNumber), [pageNumber]);

  const selectPage = (page) => {
    setCurrentPage(page);
    selectPageEvent(page);
  };

  const renderPaginationItems = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const paginationItems = [];

    // Add the first page with an ellipsis if necessary
    if (startPage > 1) {
      paginationItems.push(
        <Pagination.Item key={1} onClick={() => selectPage(1)}>
          1
        </Pagination.Item>,
      );
      if (startPage > 2) {
        paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    // Add the range of pages
    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => selectPage(i)}
        >
          {i}
        </Pagination.Item>,
      );
    }

    // Add the last page with an ellipsis if necessary
    if (endPage < pageCount) {
      if (endPage < pageCount - 1) {
        paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      paginationItems.push(
        <Pagination.Item key={pageCount} onClick={() => selectPage(pageCount)}>
          {pageCount}
        </Pagination.Item>,
      );
    }

    return paginationItems;
  };

  return (
    <Pagination className={disabled ? "disabled-div" : ""}>
      <Pagination.Prev
        onClick={() => selectPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1 || pageCount === 0}
      />
      {pageCount > 0 ? (
        renderPaginationItems()
      ) : (
        <Pagination.Item key={1} active disabled>
          {0}
        </Pagination.Item>
      )}
      <Pagination.Next
        onClick={() => selectPage((prev) => Math.min(prev + 1, pageCount))}
        disabled={currentPage === pageCount || pageCount === 0}
      />
    </Pagination>
  );
}

export default Paginator;
