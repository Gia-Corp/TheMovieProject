import { useLocation } from "react-router-dom";

function MovieDetail() {
  const { state } = useLocation();
  const { movie } = state;

  return (
    <div style={{ color: "#fff" }}>
      <h1>{`${movie.title} (#${movie.id})`}</h1>
      <p>Director: {movie.director}</p>
      <p>Año: {movie.year}</p>
      <p>{movie.watched ? "Vista" : "No vista"}</p>
    </div>
  );
}

export default MovieDetail;
