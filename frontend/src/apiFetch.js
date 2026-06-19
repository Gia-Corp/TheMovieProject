export function buildApiFetch(setAccessToken) {
  return async function apiFetch(url, options = {}) {
    const response = await fetch(url, options);

    if (response.status === 401) {
      const refreshResponse = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        setAccessToken(null);
        throw new Error("SESSION_EXPIRED");
      }

      const { access_token } = await refreshResponse.json();
      setAccessToken(access_token);

      return fetch(url, options);
    }

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const body = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const error = new Error(
        body?.detail ?? body?.message ?? body ?? "Error desconocido",
      );
      error.status = response.status;
      throw error;
    }

    return response;
  };
}
