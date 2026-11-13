import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildApiFetch, clearRequestCache } from "@/apiFetch";

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
    clearRequestCache();
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

  it("reutiliza la respuesta cacheada para un GET idéntico", async () => {
    const body = { movies: [{ id: 1 }], metadata: { page_count: 1 } };
    const fetchMock = vi.fn().mockResolvedValue(makeResponse({ body }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    const first = await apiFetch("/api/movies?page=1&size=14");
    const second = await apiFetch("/api/movies?page=1&size=14");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await first.json()).toEqual(body);
    expect(await second.json()).toEqual(body);
  });

  it("no cachea requests que no son GET", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse({ body: {} }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await apiFetch("/api/movies", { method: "POST" });
    await apiFetch("/api/movies", { method: "POST" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("invalida el listado y el detalle de la peli tras una mutación", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse({ body: {} }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await apiFetch("/api/movies?page=1&size=14");
    await apiFetch("/api/movies/7");

    await apiFetch("/api/movies/7", { method: "PATCH" });

    await apiFetch("/api/movies?page=1&size=14");
    await apiFetch("/api/movies/7");

    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("no cachea los endpoints de autenticación", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse({ body: {} }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await apiFetch("/auth/refresh");
    await apiFetch("/auth/refresh");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("stale-while-revalidate", () => {
  function flush() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sirve el dato viejo al instante y revalida en segundo plano", async () => {
    const url = "/api/movies?page=1&size=14";
    const oldBody = { movies: [{ id: 1 }] };
    const newBody = { movies: [{ id: 2 }] };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeResponse({ body: oldBody }))
      .mockResolvedValueOnce(makeResponse({ body: newBody }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());

    const first = await apiFetch(url);
    expect(await first.json()).toEqual(oldBody);

    vi.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));

    const stale = await apiFetch(url);
    expect(await stale.json()).toEqual(oldBody);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await flush();

    const fresh = await apiFetch(url);
    expect(await fresh.json()).toEqual(newBody);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("deduplica las revalidaciones en vuelo para la misma url", async () => {
    const url = "/api/movies?page=2&size=14";
    const oldBody = { movies: [{ id: 1 }] };
    const newBody = { movies: [{ id: 2 }] };
    let resolveRevalidation;
    const pendingRevalidation = new Promise((resolve) => {
      resolveRevalidation = resolve;
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeResponse({ body: oldBody }))
      .mockReturnValueOnce(pendingRevalidation);
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await apiFetch(url);

    vi.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));

    const firstStale = await apiFetch(url);
    const secondStale = await apiFetch(url);
    expect(await firstStale.json()).toEqual(oldBody);
    expect(await secondStale.json()).toEqual(oldBody);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    resolveRevalidation(makeResponse({ body: newBody }));
    await flush();

    const fresh = await apiFetch(url);
    expect(await fresh.json()).toEqual(newBody);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("descarta la revalidación si hubo una mutación mientras estaba en vuelo", async () => {
    const url = "/api/movies?page=3&size=14";
    const oldBody = { movies: [{ id: 1 }] };
    const staleBody = { movies: [{ id: 2 }] };
    const mutatedBody = { movies: [{ id: 3 }] };
    let resolveRevalidation;
    const pendingRevalidation = new Promise((resolve) => {
      resolveRevalidation = resolve;
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeResponse({ body: oldBody }))
      .mockReturnValueOnce(pendingRevalidation)
      .mockResolvedValueOnce(makeResponse({ body: {} }))
      .mockResolvedValueOnce(makeResponse({ body: mutatedBody }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await apiFetch(url);

    vi.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));
    await apiFetch(url);

    await apiFetch("/api/movies/7", { method: "PATCH" });

    resolveRevalidation(makeResponse({ body: staleBody }));
    await flush();

    const afterMutation = await apiFetch(url);
    expect(await afterMutation.json()).toEqual(mutatedBody);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("hace una request bloqueante cuando la entrada superó la ventana stale", async () => {
    const url = "/api/movies?page=4&size=14";
    const oldBody = { movies: [{ id: 1 }] };
    const newBody = { movies: [{ id: 2 }] };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeResponse({ body: oldBody }))
      .mockResolvedValueOnce(makeResponse({ body: newBody }));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await apiFetch(url);

    vi.setSystemTime(new Date("2026-01-01T00:06:01.000Z"));

    const response = await apiFetch(url);
    expect(await response.json()).toEqual(newBody);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("conserva el dato viejo si la revalidación falla", async () => {
    const url = "/api/movies?page=5&size=14";
    const oldBody = { movies: [{ id: 1 }] };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(makeResponse({ body: oldBody }))
      .mockRejectedValueOnce(new Error("network down"))
      .mockRejectedValueOnce(new Error("network down again"));
    vi.stubGlobal("fetch", fetchMock);

    const apiFetch = buildApiFetch(vi.fn(), vi.fn());
    await apiFetch(url);

    vi.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));
    const stale = await apiFetch(url);
    expect(await stale.json()).toEqual(oldBody);

    await flush();

    const stillStale = await apiFetch(url);
    expect(await stillStale.json()).toEqual(oldBody);

    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
