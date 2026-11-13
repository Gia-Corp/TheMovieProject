import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApiFetch } from "@/apiFetch";

function makeResponse({
  ok = true,
  status = 200,
  body = null,
  contentType = "application/json",
} = {}) {
  return {
    ok,
    status,
    headers: { get: () => contentType },
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body ?? "")),
  };
}

describe("buildApiFetch", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("devuelve la respuesta cuando la request es exitosa", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse({ body: { movies: [] } }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    const response = await apiFetch("/api/movies");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/movies", {});
    expect(response.ok).toBe(true);
  });

  it("lanza un error con el detail del body y el status cuando la respuesta no es ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeResponse({ ok: false, status: 404, body: { detail: "Movie not found" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await expect(apiFetch("/api/movies/1")).rejects.toMatchObject({
      message: "Movie not found",
      status: 404,
    });
  });

  it("usa el body como texto cuando el content type no es json", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeResponse({
        ok: false,
        status: 500,
        contentType: "text/plain",
        body: "Error del servidor",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await expect(apiFetch("/api/movies")).rejects.toThrow("Error del servidor");
  });

  it("cae con el mensaje por defecto cuando el body no trae mensaje", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse({ ok: false, status: 502 }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await expect(apiFetch("/api/movies")).rejects.toThrow("Error desconocido");
  });

  it("refresca la sesión y reintenta la request original al recibir 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeResponse({ ok: false, status: 401 }))
      .mockResolvedValueOnce(
        makeResponse({ body: { access_token: "new-token", user: { id: "u1" } } }),
      )
      .mockResolvedValueOnce(makeResponse({ body: { movies: [] } }));

    vi.stubGlobal("fetch", fetchMock);
    const setAccessToken = vi.fn();
    const setCurrentUser = vi.fn();
    const apiFetch = buildApiFetch(setAccessToken, setCurrentUser);

    const response = await apiFetch("/api/movies");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    expect(setAccessToken).toHaveBeenCalledWith("new-token");
    expect(setCurrentUser).toHaveBeenCalledWith({ id: "u1" });
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/movies", {});
    expect(response.ok).toBe(true);
  });

  it("limpia la sesión y lanza SESSION_EXPIRED si el refresh falla", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeResponse({ ok: false, status: 401 }))
      .mockResolvedValueOnce(
        makeResponse({ ok: false, status: 401, body: { message: "Refresh expirado" } }),
      );

    vi.stubGlobal("fetch", fetchMock);
    const setAccessToken = vi.fn();
    const setCurrentUser = vi.fn();
    const apiFetch = buildApiFetch(setAccessToken, setCurrentUser);

    await expect(apiFetch("/api/movies")).rejects.toThrow("SESSION_EXPIRED");
    expect(setAccessToken).toHaveBeenCalledWith(null);
    expect(setCurrentUser).toHaveBeenCalledWith(null);
  });
});
