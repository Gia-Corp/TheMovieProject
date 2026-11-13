export class MovieRepository {
  static #MOVIES_PATH = "/api/movies";

  constructor(apiFetch) {
    this.fetch = apiFetch;
  }

  async getBodyContent(response) {
    return response.json();
  }

  async getMovies({ page, size, title, signal }) {
    const url = new URL(MovieRepository.#MOVIES_PATH, window.location.origin);
    url.searchParams.set("page", page);
    url.searchParams.set("size", size);

    if (title) {
      url.searchParams.set("title", title);
    }

    const response = await this.fetch(url, { signal });

    return this.getBodyContent(response);
  }

  async getMovie(id, signal) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}`,
      window.location.origin,
    );

    const response = await this.fetch(url, { signal });

    return this.getBodyContent(response);
  }

  async createMovie(movie, accessToken) {
    const url = new URL(MovieRepository.#MOVIES_PATH, window.location.origin);

    const response = await this.fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(movie),
    });

    return this.getBodyContent(response);
  }

  async updateMovie(id, movie, accessToken) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}`,
      window.location.origin,
    );

    const response = await this.fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(movie),
    });

    return this.getBodyContent(response);
  }

  async updateWatchEvents(id, userIds, accessToken) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}/watch-events`,
      window.location.origin,
    );

    const response = await this.fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userIds),
    });

    return this.getBodyContent(response);
  }

  async deleteMovie(id, accessToken) {
    const url = new URL(
      `${MovieRepository.#MOVIES_PATH}/${id}`,
      window.location.origin,
    );

    const response = await this.fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return this.getBodyContent(response);
  }
}
