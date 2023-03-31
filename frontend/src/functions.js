import axios from 'axios';

const herolistAll = () => {
    return axios
        .get("http://localhost:5000/hero")
        .then(res => {
            return res.data
        })
        .catch(err => { throw err.response.data })
}

const movieget = (id) => {
    return axios
        .post("http://localhost:5000/movie/get", {
            id
        })
        .then(res => {
            return res.data
        })
        .catch(err => { throw err.response.data })
}

//API functions

const searchAPImovie = (query) => {
    return axios
        .get(`https://api.themoviedb.org/3/search/movie?api_key=6219c1b0835cb6191273f70128265f35&query=${query}`)
        .then(res => {
            return res.data
        })
        .catch(err => { throw err.response.data })
}