import ListItem from "../ListItem";
import MovieCard from "../MovieCard/MovieCard";
import "./List.css";

function List({ list }) {
  return (
    <div className="movies-list">
      {list.map((item) => (
        // <ListItem key={item.id} item={item} />
        <MovieCard key={item.id} />
      ))}
    </div>
  );
}

export default List;
