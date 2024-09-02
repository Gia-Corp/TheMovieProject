import axios from "axios";

export class MovieService {
  static #MOVIES_PATH = "/movies";
  #service;

  constructor() {
    this.#service = axios.create({
      baseURL: process.env.REACT_APP_BACKEND_URL,
    });
  }
  getList({ page, size }) {
    return this.#service
      .get(MovieService.#MOVIES_PATH, {
        params: {
          page,
          size,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw err.response.data;
      });
  }
}
