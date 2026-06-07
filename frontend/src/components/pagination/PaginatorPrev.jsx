function PaginatorPrev({ onClick, isHidden }) {
  return (
    <button className="primary-button navigation" onClick={onClick} style={{visibility: isHidden ? "hidden" : "visible"}}>
      {"<"}
    </button>
  );
}

export default PaginatorPrev;
