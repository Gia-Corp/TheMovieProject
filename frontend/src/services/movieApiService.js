import axios from "axios";

export class MovieApiService {
  static #SEARCH_PATH = "/3/search/movie";
  #service;

  constructor() {
    this.#service = axios.create({
      baseURL: process.env.REACT_APP_MOVIE_API_URL,
      params: {
        api_key: process.env.REACT_APP_MOVIE_API_KEY,
      },
    });
  }
  getMovieData({ name, year }) {
    return this.#service
      .get(MovieApiService.#SEARCH_PATH, {
        params: {
          query: name,
          year,
        },
      })
      .then((res) => {
        if (res.data.results.length !== 0) {
          return res.data.results[0];
        } else {
          throw new Error("no results");
        }
      })
      .catch((err) => {
        throw err.response.data;
      });
  }
}
