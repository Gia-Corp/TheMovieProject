import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

console.log(backendUrl)

const getMovies = () => {
    return axios
        .get(backendUrl+"/movies")
        .then(res => {
            return res.data
        })
        .catch(err => { throw err.response.data })
}

// const movieget = (id) => {
//     return axios
//         .post(backendUrl+"/movie/get", {
//             id
//         })
//         .then(res => {
//             return res.data
//         })
//         .catch(err => { throw err.response.data })
// }

//API functions

const searchAPImovie = (query) => {
    return axios
        .get(`https://api.themoviedb.org/3/search/movie?api_key=6219c1b0835cb6191273f70128265f35&query=${query}`)
        .then(res => {
            return res.data
        })
        .catch(err => { throw err.response.data })
}

export {
    getMovies,
    searchAPImovie
}