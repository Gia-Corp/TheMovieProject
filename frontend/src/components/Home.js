import React,{useContext, useEffect,useState} from 'react';
import Navbar from './Navbar';
import {Link} from 'react-router-dom';
import List from './List';
import Paginator from './Paginator';
import { MovieServiceContext } from './MovieServiceProvider';

const Home = ({movie}) => {

    const movieService = useContext(MovieServiceContext);

    const [list,setList] = useState ([]);
    const [error,setError] = useState (false);
    const [loading,setLoading] = useState (false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);

    useEffect (()=>{

        setError (false)
        setLoading (true)

        movieService.getList({
            page: currentPage,
            size: 10
        })
        .then(res=>{
            if (res !== null){    
                setList(res.movies);
                setTotalPageCount(res.metadata.page_count);
                setLoading(false)

            }else{
                setLoading(false)
                setError(true)
            }
        })
        .catch((err)=>{
            console.error(err);
        })
    },[currentPage])

    return (
        <div>
            <Paginator
                pageCount={totalPageCount}
                pageNumber={currentPage}
                disabled={loading}
                selectPageEvent={(pageNumber)=>setCurrentPage(pageNumber)}
            />
            {(loading)?
            <h3>cargando</h3>
            :
            <div>
                
                {(error)?
                <h3>ERROR</h3>
                :
                <List list={list}/>
                }
                
            </div>
            }
            <Paginator
                pageCount={totalPageCount}
                pageNumber={currentPage}
                disabled={loading}
                selectPageEvent={(pageNumber)=>setCurrentPage(pageNumber)}
            />
        </div>
    )
}

export default Home;