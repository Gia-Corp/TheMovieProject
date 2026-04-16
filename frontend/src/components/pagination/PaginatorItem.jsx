function PaginatorItem({ active, disabled, onClick, children }) {
  return (
    <button
      className={`primary-button ${active ? "active" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default PaginatorItem;
