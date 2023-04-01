import React from 'react';
import ListItem from './ListItem';

const List = ({list}) => {
	return (
        <div>
            <div className="row row-cols-1 row-cols-md-6 mt-1 mb-3 g-3">
                        {list.map(item => (
                                <ListItem 
                                key = {item[0]}
                                item = {item}
                                />
                        ))}
            </div>
      </div>
	);
}

export default List;