function MovieSemiWatchedIcon({
  size = "100%",
  color = "var(--check-clr)",
  onClick,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      onClick={onClick}
    >
      <path
        d="M12,21h0a9,9,0,0,1-9-9H3a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9h0A9,9,0,0,1,12,21ZM8,11.5l3,3,5-5"
        style={{
          fill: "none",
          stroke: color,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          "stroke-width": 2,
        }}
      />
    </svg>
  );
}

export default MovieSemiWatchedIcon;
