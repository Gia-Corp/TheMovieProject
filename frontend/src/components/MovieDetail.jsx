import { useParams } from "react-router-dom";

function MovieDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Estas viendo la peli con id: {id}</h1>
    </div>
  );
}

export default MovieDetail;
