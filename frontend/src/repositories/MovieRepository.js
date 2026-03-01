export class MovieRepository {
  static #MOVIES_PATH = "/movies";
  static #BASE_URL = import.meta.env.VITE_BACKEND_URL;

  async getMovies({ page, size }) {
    const url = new URL(
      MovieRepository.#MOVIES_PATH,
      MovieRepository.#BASE_URL,
    );
    url.searchParams.set("page", page);
    url.searchParams.set("size", size);

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    return res.json();
  }
}
