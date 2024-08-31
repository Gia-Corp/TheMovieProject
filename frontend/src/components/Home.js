import React,{useContext, useEffect,useState} from 'react';
import Navbar from './Navbar';
import {Link} from 'react-router-dom';
import List from './List';
import PagMenu from './PagMenu';
import { MovieServiceContext } from './MovieServiceProvider';

const Home = ({movie}) => {

    const movieService = useContext(MovieServiceContext);

    const [list,setList] = useState ([]);
    const [error,setError] = useState (false);
    const [refresh,setRefresh] = useState (false);
    const [loading,setLoading] = useState (false);

    const [currentPage, setCurrentPage] = useState(1);
    const [listPerPage] = useState(1);
    const [indexOfLastList,setIndexOfLastList] = useState(currentPage * listPerPage)
    const [indexOfFirstList,setIndexOfFirstList] = useState(indexOfLastList - listPerPage)
    const [currentList,setCurrentList] = useState([])

    useEffect (()=>{

        setError (false)
        setLoading (true)

        movieService.getList({
            page: 1,
            size: 10
        })
        .then(res=>{
            if (res !== null){    
                setList(res.movies);
                //setCurrentList (list.slice(indexOfFirstList, indexOfLastList))
                setLoading(false)

            }else{
                setLoading(false)
                setError(true)
            }
        })
        .catch((err)=>{
            console.error(err);
        })
    },[])

    //Cambiar de pagina
    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <div>
            {(loading)?
            <h3>cargando</h3>
            :
            <div>
                {(error)?
                <h3>ERROR</h3>
                :
                <List list={list}/>
                }
                <PagMenu
                listPerPage={listPerPage} 
                totalList={list.length} 
                paginate={paginate} 
                setCurrentPage={setCurrentPage} 
                currentPage={currentPage}
                />
            </div>
            }
        </div>
    )
}

export default Home;