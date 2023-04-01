import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import { searchAPImovie } from '../functions';

const ListItem = ({item}) => {

    const [info,setInfo] = useState ({});
    const [error,setError] = useState (false);
    const [loading,setLoading] = useState (false);
    const [retry,setRetry] = useState(false);

    useEffect (()=>{

        setError (false)
        setLoading (true)

        searchAPImovie(item[0])
        .then ((res)=>{
            if (res !== null){
                setInfo(res.results[0])
                setLoading(false)
            }else{
                setLoading(false)
                setError(true)
            }
            return
        })
        .catch((err)=>{
            setLoading (false)
            setError (true)
            return
        })
        return
    },[])

    return (
            <div>
        {(loading)?
            <div class="card border-primary mb-3 h-100" style={{maxWidth: '20rem'}}>
            <div class="card-body">
                <h4 class="card-title">Loading</h4>
            </div>
            </div>
        :
        <div class="card border-secondary mb-0 h-100 md-3" style={{maxWidth: '20rem'}}>
            <div class="card-body">
                {(info !== undefined)?
                <img src={`https://image.tmdb.org/t/p/w500${info.poster_path}`} className="card-img-top" width="268.16px" height="402.23px" alt="NO IMAGE" ></img>
                :
                <svg xmlns="http://www.w3.org/2000/svg" class="d-block user-select-none" width="268.16px" height="402.23px" aria-label="Placeholder: Image cap" focusable="false" role="img" preserveAspectRatio="xMidYMid slice" viewBox="0 0 318 180" style={{fontSize:"1.125rem",textAnchor:"middle"}}>
                    <rect width="100%" height="100%" fill="#868e96"></rect>
                    <text x="50%" y="50%" fill="#dee2e6" dy=".3em">No Image</text>
                </svg>
                }     
                <h3 class="card-title p-3">{item[0]}</h3>
            </div>
            <div class="card-footer p-3 d-flex justify-content-between">
                <h6 class="card-subtitle text-muted " id="inlineText">{item[1]}</h6>
            </div>
        </div>
        }
        </div>
    )
	
}

export default (ListItem);