export class PosterRepository {
  static #SEARCH_PATH = "/3/search/movie";
  static #BASE_URL = import.meta.env.VITE_MOVIE_API_URL;
  static #API_KEY = import.meta.env.VITE_MOVIE_API_KEY;

  async getMovieData({ name, year }) {
    const url = new URL(
      PosterRepository.#SEARCH_PATH,
      PosterRepository.#BASE_URL,
    );
    url.searchParams.set("api_key", PosterRepository.#API_KEY);
    url.searchParams.set("query", name);
    url.searchParams.set("year", year);

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    const data = await res.json();

    if (data.results.length === 0) {
      throw new Error("no results");
    }

    return data.results[0];
  }
}
