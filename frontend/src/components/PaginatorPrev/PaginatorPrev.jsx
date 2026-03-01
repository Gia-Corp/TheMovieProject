function PaginatorPrev({ onClick, disabled }) {
  return (
    <button className="pagination" onClick={onClick} disabled={disabled}>
      «
    </button>
  );
}

export default PaginatorPrev;
