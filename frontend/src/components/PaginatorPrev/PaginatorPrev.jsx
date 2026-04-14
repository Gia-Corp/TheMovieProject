function PaginatorPrev({ onClick, disabled }) {
  return (
    <button className="primary-button" onClick={onClick} disabled={disabled}>
      {"<"}
    </button>
  );
}

export default PaginatorPrev;
