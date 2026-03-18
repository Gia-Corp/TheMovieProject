export class MovieRepository {
  static #MOVIES_PATH = "/movies";
  static #BASE_URL = import.meta.env.VITE_BACKEND_URL;

  async getMovies({ page, size, title }) {
    const url = new URL(
      MovieRepository.#MOVIES_PATH,
      MovieRepository.#BASE_URL,
    );
    url.searchParams.set("page", page);
    url.searchParams.set("size", size);

    if (title) {
      url.searchParams.set("title", title);
    }

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    return res.json();
  }

  async getMovie(id) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}`,
      MovieRepository.#BASE_URL,
    );

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    return res.json();
  }

  async updateMovie(movieId, movie) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${movieId}`,
      MovieRepository.#BASE_URL,
    );

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movie),
    });

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    return res.json();
  }
}
