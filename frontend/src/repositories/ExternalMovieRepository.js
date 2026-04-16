export class ExternalMovieRepository {
  static #BASE_URL = import.meta.env.VITE_MOVIE_API_URL_2;
  static #API_KEY = import.meta.env.VITE_MOVIE_API_KEY_2;

  async getBodyContent(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  async getMovies({ title }) {
    const url = new URL(ExternalMovieRepository.#BASE_URL);
    url.searchParams.set("apikey", ExternalMovieRepository.#API_KEY);
    url.searchParams.set("type", "movie");

    if (title) {
      url.searchParams.set("s", title);
    }

    const response = await fetch(url);

    return this.getBodyContent(response);
  }
}
