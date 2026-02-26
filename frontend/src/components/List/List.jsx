import MovieCard from "../MovieCard/MovieCard";
import "./List.css";

function List({ list }) {
  return (
    <div className="movies-list">
      {list.map((item) => (
        <MovieCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default List;
