import ListItem from "../ListItem";
import "./List.css";

function List({ list }) {
  return (
    <div className="movies-list">
      {list.map((item) => (
        <ListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default List;
