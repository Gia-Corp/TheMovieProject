import ListItem from "./ListItem";

function List({ list }) {
  return (
    <div>
      <div className="row row-cols-1 row-cols-md-5 mt-1 mb-3 g-3">
        {list.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default List;
