import "./Tooltip.css";

function Tooltip({ text, children }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <span className="tooltip">{text}</span>
    </div>
  );
}

export default Tooltip;
