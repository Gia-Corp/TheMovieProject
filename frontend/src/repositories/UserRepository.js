export class UserRepository {
  static #USERS_PATH = "/api/users";

  constructor(apiFetch) {
    this.fetch = apiFetch;
  }

  async getBodyContent(response) {
    return response.json();
  }

  async getUser(id, accessToken) {
    const url = new URL(
      `${UserRepository.#USERS_PATH}/${id}`,
      window.location.origin,
    );

    const response = await this.fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return this.getBodyContent(response);
  }
}
