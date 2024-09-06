import ListItem from "./ListItem";
import { v1 as uuidv1 } from "uuid";
import PropTypes from "prop-types";

function List({ list }) {
  return (
    <div>
      <div className="row row-cols-1 row-cols-md-5 mt-1 mb-3 g-3">
        {list.map((item) => (
          <ListItem key={uuidv1()} item={item} />
        ))}
      </div>
    </div>
  );
}

List.propTypes = {
  list: PropTypes.array,
};

export default List;
