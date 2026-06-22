export class UserRepository {
  static #USERS_PATH = "/api/users";

  constructor(apiFetch) {
    this.fetch = apiFetch;
  }

  async getBodyContent(response) {
    return response.json();
  }

  async getUser(id) {
    const url = new URL(
      `${UserRepository.#USERS_PATH}/${id}`,
      window.location.origin,
    );

    const response = await this.fetch(url);

    return this.getBodyContent(response);
  }
}
