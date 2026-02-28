function PaginatorPrev({ onClick, disabled }) {
  return (
    <button className="pagination-prev" onClick={onClick} disabled={disabled}>
      «
    </button>
  );
}

export default PaginatorPrev;
