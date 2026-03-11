import { useEffect, useState } from "react";
import PaginatorPrev from "../PaginatorPrev/PaginatorPrev";
import PaginatorItem from "../PaginatorItem/PaginatorItem";
import PaginatorNext from "../PaginatorNext/PaginatorNext";
import PaginatorEllipsis from "../PaginatorEllipsis/PaginatorEllipsis";
import "./Paginator.css";

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
        <PaginatorItem key={1} onClick={() => selectPage(1)}>
          1
        </PaginatorItem>,
      );
      if (startPage > 2) {
        paginationItems.push(<PaginatorEllipsis key="start-ellipsis" />);
      }
    }

    // Add the range of pages
    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <PaginatorItem
          key={i}
          active={i === currentPage}
          disabled={i === currentPage}
          onClick={() => selectPage(i)}
        >
          {i}
        </PaginatorItem>,
      );
    }

    // Add the last page with an ellipsis if necessary
    if (endPage < pageCount) {
      if (endPage < pageCount - 1) {
        paginationItems.push(<PaginatorEllipsis key="end-ellipsis" />);
      }
      paginationItems.push(
        <PaginatorItem key={pageCount} onClick={() => selectPage(pageCount)}>
          {pageCount}
        </PaginatorItem>,
      );
    }

    return paginationItems;
  };

  const hidePrevButton = currentPage === 1 || pageCount === 0;
  const hideNextButton = currentPage === pageCount || pageCount === 0;

  return (
    <div className={`paginator ${disabled ? "disabled-div" : ""}`}>
      {hidePrevButton ? (
        ""
      ) : (
        <PaginatorPrev
          onClick={() => selectPage((prev) => Math.max(prev - 1, 1))}
          disabled={hidePrevButton}
        />
      )}
      {pageCount > 0 ? (
        renderPaginationItems()
      ) : (
        <PaginatorItem key={1} active disabled>
          {"Cargando..."}
        </PaginatorItem>
      )}
      {hideNextButton ? (
        ""
      ) : (
        <PaginatorNext
          onClick={() => selectPage((prev) => Math.min(prev + 1, pageCount))}
          disabled={hideNextButton}
        />
      )}
    </div>
  );
}

export default Paginator;
