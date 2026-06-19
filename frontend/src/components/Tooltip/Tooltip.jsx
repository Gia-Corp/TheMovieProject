import "./Tooltip.css";

function Tooltip({ children, content, nowrap = true }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip ${nowrap ? "tooltip--nowrap" : ""}`}>
        {content}
      </div>
    </div>
  );
}

export default Tooltip;
