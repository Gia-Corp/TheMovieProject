function PaginatorItem({ active, disabled, onClick, children }) {
  return (
    <button
      className={`pagination-item ${active ? "active" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default PaginatorItem;
