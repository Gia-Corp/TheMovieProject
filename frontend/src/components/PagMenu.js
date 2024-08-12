import { useState } from 'react';
import Pagination from 'react-bootstrap/Pagination';

function PagMenu({listPerPage, totalList, paginate, currentPage}) {

    const [pageNumbers] = useState ([])

    for(let i=1; i <= Math.ceil(totalList / listPerPage); i++) {
        pageNumbers.push(i);
    }

  return (
    <Pagination>
      <Pagination.First />
      <Pagination.Prev />
      <Pagination.Item onClick={() => paginate(currentPage - 1)}>{(currentPage === pageNumbers[0])?'disabled':null}</Pagination.Item>
      <Pagination.Ellipsis />
      {
        pageNumbers.map(number => (
        <Pagination>
        {(currentPage === number)?
        <Pagination.Item active onClick={() => paginate(number)}>{number}</Pagination.Item>
        : 
        <Pagination.Item  onClick={() => paginate(number)}>{number}</Pagination.Item>
        }
        </Pagination>
      ))}

      <Pagination.Ellipsis />
      <Pagination.Item onClick={() => paginate(currentPage - +1)}>{(currentPage === pageNumbers[pageNumbers.length - 1])?'disabled':null}</Pagination.Item>
      <Pagination.Next />
      <Pagination.Last />
    </Pagination>
  );
}

export default PagMenu;