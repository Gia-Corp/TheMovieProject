function PaginatorNext({ onClick, disabled }) {
  return (
    <button className="primary-button" onClick={onClick} disabled={disabled}>
      {">"}
    </button>
  );
}

export default PaginatorNext;
