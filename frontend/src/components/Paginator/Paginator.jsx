import "./Paginator.css";
import PaginatorPrev from "@/components/PaginatorPrev/PaginatorPrev";
import PaginatorItem from "@/components/PaginatorItem/PaginatorItem";
import PaginatorNext from "@/components/PaginatorNext/PaginatorNext";
import PaginatorEllipsis from "@/components/PaginatorEllipsis/PaginatorEllipsis";

function Paginator({ currentPage, totalPages, disabled, handlePageSelection }) {
  const MAX_VISIBLE_PAGES = 5;
  const hidePrevButton = currentPage === 1 || totalPages === 0;
  const hideNextButton = currentPage === totalPages || totalPages === 0;

  function calculateLimits() {
    let startPage = Math.max(
      1,
      currentPage - Math.floor(MAX_VISIBLE_PAGES / 2),
    );
    let endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

    if (endPage - startPage < MAX_VISIBLE_PAGES - 1) {
      startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
    }

    return { startPage, endPage };
  }

  function createItemsList() {
    const { startPage, endPage } = calculateLimits();
    const itemsList = [];

    // Add the first page with an ellipsis if necessary
    if (startPage > 1) {
      itemsList.push(
        <PaginatorItem key={1} onClick={() => handlePageSelection(1)}>
          1
        </PaginatorItem>,
      );
    }

    if (startPage > 2) {
      itemsList.push(<PaginatorEllipsis key="start-ellipsis" />);
    }

    // Add the range of pages
    for (let i = startPage; i <= endPage; i++) {
      itemsList.push(
        <PaginatorItem
          key={i}
          active={i === currentPage}
          disabled={i === currentPage}
          onClick={() => handlePageSelection(i)}
        >
          {i}
        </PaginatorItem>,
      );
    }

    // Add the last page with an ellipsis if necessary
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        itemsList.push(<PaginatorEllipsis key="end-ellipsis" />);
      }
      itemsList.push(
        <PaginatorItem
          key={totalPages}
          onClick={() => handlePageSelection(totalPages)}
        >
          {totalPages}
        </PaginatorItem>,
      );
    }

    return itemsList;
  }

  return (
    <div className={`paginator ${disabled ? "disabled-div" : ""}`}>
      {hidePrevButton ? null : (
        <PaginatorPrev
          onClick={() => handlePageSelection((prev) => Math.max(prev - 1, 1))}
          disabled={hidePrevButton}
        />
      )}
      {totalPages > 0 ? (
        createItemsList()
      ) : (
        <PaginatorItem key={1} active disabled>
          {"Cargando..."}
        </PaginatorItem>
      )}
      {hideNextButton ? null : (
        <PaginatorNext
          onClick={() =>
            handlePageSelection((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={hideNextButton}
        />
      )}
    </div>
  );
}

export default Paginator;
