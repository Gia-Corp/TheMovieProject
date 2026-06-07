function PaginatorNext({ onClick, isHidden }) {
  return (
    <button
      className="navigation"
      onClick={onClick}
      style={{ visibility: isHidden ? "hidden" : "visible" }}
    >
      {">"}
    </button>
  );
}

export default PaginatorNext;
