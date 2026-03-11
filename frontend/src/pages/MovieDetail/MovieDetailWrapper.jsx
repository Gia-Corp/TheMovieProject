import { useParams } from "react-router-dom";
import MovieDetail from "./MovieDetail.jsx";

function MovieDetailWrapper() {
  const { id } = useParams();
  return <MovieDetail key={id} />;
}

export default MovieDetailWrapper;
