import { describe, expect, it, vi } from "vitest";
import { MovieRepository } from "@/repositories/MovieRepository";

function makeResponse(body) {
  return { json: async () => body };
}

function createRepo() {
  const apiFetch = vi.fn().mockResolvedValue(
    makeResponse({ movies: [], metadata: { page_count: 1 } }),
  );
  return { apiFetch, repo: new MovieRepository(apiFetch) };
}

function lastCall(apiFetch) {
  const [url, options] = apiFetch.mock.calls[apiFetch.mock.calls.length - 1];
  return { url, options };
}

describe("MovieRepository", () => {
  it("getMovies arma la query con page, size y title opcional", async () => {
    const { apiFetch, repo } = createRepo();

    const res = await repo.getMovies({ page: 2, size: 14, title: "matrix" });

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const { url } = lastCall(apiFetch);
    expect(url.pathname).toBe("/api/movies");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("size")).toBe("14");
    expect(url.searchParams.get("title")).toBe("matrix");
    expect(res).toEqual({ movies: [], metadata: { page_count: 1 } });
  });

  it("getMovies no setea el param title cuando no viene", async () => {
    const { apiFetch, repo } = createRepo();

    await repo.getMovies({ page: 1, size: 14 });

    const { url } = lastCall(apiFetch);
    expect(url.pathname).toBe("/api/movies");
    expect(url.searchParams.get("title")).toBeNull();
  });

  it("getMovie arma el path del detalle", async () => {
    const { apiFetch, repo } = createRepo();

    await repo.getMovie(42);

    const { url } = lastCall(apiFetch);
    expect(url.pathname).toBe("/api/movies/42");
  });

  it("createMovie hace POST con Authorization y body", async () => {
    const { apiFetch, repo } = createRepo();

    await repo.createMovie({ title: "Alien", year: 1979, watched_by: [] }, "token-123");

    const { url, options } = lastCall(apiFetch);
    expect(url.pathname).toBe("/api/movies");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer token-123");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual({
      title: "Alien",
      year: 1979,
      watched_by: [],
    });
  });

  it("updateMovie hace PATCH con Authorization y body", async () => {
    const { apiFetch, repo } = createRepo();

    await repo.updateMovie(7, { title: "Alien" }, "token-123");

    const { url, options } = lastCall(apiFetch);
    expect(url.pathname).toBe("/api/movies/7");
    expect(options.method).toBe("PATCH");
    expect(options.headers.Authorization).toBe("Bearer token-123");
    expect(JSON.parse(options.body)).toEqual({ title: "Alien" });
  });

  it("updateWatchEvents hace PUT con los userIds", async () => {
    const { apiFetch, repo } = createRepo();

    await repo.updateWatchEvents(7, ["u1", "u2"], "token-123");

    const { url, options } = lastCall(apiFetch);
    expect(url.pathname).toBe("/api/movies/7/watch-events");
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual(["u1", "u2"]);
  });

  it("deleteMovie hace DELETE con Authorization", async () => {
    const { apiFetch, repo } = createRepo();

    await repo.deleteMovie(7, "token-123");

    const { url, options } = lastCall(apiFetch);
    expect(url.pathname).toBe("/api/movies/7");
    expect(options.method).toBe("DELETE");
    expect(options.headers.Authorization).toBe("Bearer token-123");
  });
});
