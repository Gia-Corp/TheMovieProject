export class MovieRepository {
  static #MOVIES_PATH = "/api/movies";

  async getMovies({ page, size, title }) {
    const url = new URL(MovieRepository.#MOVIES_PATH, window.location.origin);
    url.searchParams.set("page", page);
    url.searchParams.set("size", size);

    if (title) {
      url.searchParams.set("title", title);
    }

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    return res.json();
  }

  async getMovie(id) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}`,
      window.location.origin,
    );

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    return res.json();
  }

  async createMovie(movie, accessToken) {
    const url = new URL(MovieRepository.#MOVIES_PATH, window.location.origin);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(movie),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    return res.json();
  }

  async updateMovie(id, movie, accessToken) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}`,
      window.location.origin,
    );

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(movie),
    });

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    return res.json();
  }

  async deleteMovie(id, accessToken) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}`,
      window.location.origin,
    );

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }

    return res.json();
  }
}
