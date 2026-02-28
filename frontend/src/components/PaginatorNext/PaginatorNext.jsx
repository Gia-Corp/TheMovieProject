function PaginatorNext({ onClick, disabled }) {
  return (
    <button className="pagination-next" onClick={onClick} disabled={disabled}>
      »
    </button>
  );
}

export default PaginatorNext;
