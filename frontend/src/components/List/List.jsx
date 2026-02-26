import MovieCard from "../MovieCard/MovieCard";
import "./List.css";

function List({ list }) {
  const newList =
    list.length > 0
      ? list
      : [null, null, null, null, null, null, null, null, null, null];

  return (
    <div className="movies-list">
      {newList.map((item, index) => {
        const itemId = item ? item.id : index;
        return <MovieCard key={itemId} item={item} />;
      })}
    </div>
  );
}

export default List;
