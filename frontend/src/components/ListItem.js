import React,{useContext, useEffect,useState} from 'react';
import { MovieApiServiceContext } from './MovieApiServiceProvider';

const ListItem = ({item}) => {

    const movieApiService = useContext(MovieApiServiceContext);

    const [info,setInfo] = useState ({});
    const [error,setError] = useState (false);
    const [loading,setLoading] = useState (false);

    useEffect (()=>{

        setError (false)
        setLoading (true)

        movieApiService.getMovieData({
            name:item.title,
            year:item.year
        })
        .then ((res)=>{ 
            if (res !== null){
                setInfo(res)
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
    },[])

    return (
            <div>
        {(loading)?
            <div className="card border-primary mb-3 h-100" style={{maxWidth: '20rem'}}>
            <div className="card-body">
                <h4 className="card-title">Loading</h4>
            </div>
            </div>
        :
        <div className="card border-secondary mb-0 h-100 md-3" style={{maxWidth: '20rem'}}>
            <div className="card-body">
                {(info !== undefined)?
                <img src={`${process.env.REACT_APP_MOVIE_API_IMAGES_URL}${info.poster_path}`} className="card-img-top" width="268.16px" height="402.23px" alt="NO IMAGE" ></img>
                :
                <svg xmlns="http://www.w3.org/2000/svg" className="d-block user-select-none" width="268.16px" height="402.23px" aria-label="Placeholder: Image cap" focusable="false" role="img" preserveAspectRatio="xMidYMid slice" viewBox="0 0 318 180" style={{fontSize:"1.125rem",textAnchor:"middle"}}>
                    <rect width="100%" height="100%" fill="#868e96"></rect>
                    <text x="50%" y="50%" fill="#dee2e6" dy=".3em">No Image</text>
                </svg>
                }     
                <h3 className="card-title p-3">{item['title']}</h3>
            </div>
            <div className="card-footer p-3 d-flex justify-content-between">
                <h6 className="card-subtitle text-muted " id="inlineText">{item['director']}</h6>
            </div>
        </div>
        }
        </div>
    )
	
}

export default (ListItem);