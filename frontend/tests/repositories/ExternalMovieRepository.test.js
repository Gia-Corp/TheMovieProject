import { describe, expect, it, vi } from "vitest";
import { ExternalMovieRepository } from "@/repositories/ExternalMovieRepository";

function makeResponse({ ok = true, body = null } = {}) {
  return { ok, json: async () => body };
}

describe("ExternalMovieRepository", () => {
  it("getMovies arma la busqueda contra OMDb con apikey, type y title", async () => {
    const apiFetch = vi.fn().mockResolvedValue(
      makeResponse({
        ok: true,
        body: {
          Search: [{ imdbID: "tt0111161", Title: "The Shawshank Redemption", Year: "1994" }],
        },
      }),
    );
    const repo = new ExternalMovieRepository(apiFetch);

    const res = await repo.getMovies({ title: "shawshank" });

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [url] = apiFetch.mock.calls[0];
    expect(url.searchParams.get("apikey")).toBe(import.meta.env.VITE_MOVIE_API_KEY_2);
    expect(url.searchParams.get("type")).toBe("movie");
    expect(url.searchParams.get("s")).toBe("shawshank");
    expect(res.Search[0].imdbID).toBe("tt0111161");
  });

  it("getMovies no setea el parametro s cuando no hay titulo", async () => {
    const apiFetch = vi.fn().mockResolvedValue(makeResponse({ ok: true, body: { Search: [] } }));
    const repo = new ExternalMovieRepository(apiFetch);

    await repo.getMovies({});

    const [url] = apiFetch.mock.calls[0];
    expect(url.searchParams.get("s")).toBeNull();
  });

  it("getBodyContent lanza un error cuando la respuesta no es ok", async () => {
    const apiFetch = vi.fn().mockResolvedValue(
      makeResponse({ ok: false, body: { message: "OMDb request failed" } }),
    );
    const repo = new ExternalMovieRepository(apiFetch);

    await expect(repo.getMovies({ title: "zzz" })).rejects.toThrow("OMDb request failed");
  });
});
