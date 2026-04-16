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

    return response;
  };
}
