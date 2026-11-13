import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ErrorBoundary } from "@/error_handling/ErrorBoundary";
import { RepositoriesContext } from "@/hooks/useRepos";
import Home from "@/pages/Home/Home";

function renderHome() {
  const getMovies = vi.fn();

  render(
    <MemoryRouter initialEntries={["/?page=1"]}>
      <RepositoriesContext.Provider value={{ movieRepo: { getMovies } }}>
        <Home />
      </RepositoriesContext.Provider>
    </MemoryRouter>,
  );

  return { getMovies };
}

const movie = {
  id: 1,
  title: "Peli A",
  poster_url: null,
  watched_by: { watcher_users: 0, total_users: 0, watch_events: [] },
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("muestra el spinner y los skeletons mientras carga", () => {
    const getMovies = vi.fn(() => new Promise(() => {}));

    const { container } = render(
      <MemoryRouter>
        <RepositoriesContext.Provider value={{ movieRepo: { getMovies } }}>
          <Home />
        </RepositoriesContext.Provider>
      </MemoryRouter>,
    );

    expect(container.querySelectorAll(".movie-card.skeleton").length).toBe(14);
  });

  it("pide la página actual y renderiza las películas al cargarse", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    render(
      <MemoryRouter initialEntries={["/?page=1"]}>
        <RepositoriesContext.Provider value={{ movieRepo: { getMovies } }}>
          <Home />
        </RepositoriesContext.Provider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Peli A")).toBeTruthy();
    expect(getMovies).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, size: 14 }),
    );
    expect(getMovies.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
  });

  it("lanza el error cuando la carga falla", async () => {
    const getMovies = vi.fn().mockRejectedValue(new Error("Fallo red"));

    render(
      <MemoryRouter>
        <RepositoriesContext.Provider value={{ movieRepo: { getMovies } }}>
          <ErrorBoundary>
            <Home />
          </ErrorBoundary>
        </RepositoriesContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/Algo salió mal/)).toBeTruthy());
  });

  it("vuelve a pedir la página siguiente al hacer clic en el paginador", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 2 },
    });

    render(
      <MemoryRouter initialEntries={["/?page=1"]}>
        <RepositoriesContext.Provider value={{ movieRepo: { getMovies } }}>
          <Home />
        </RepositoriesContext.Provider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Peli A")).toBeTruthy();
    fireEvent.click(screen.getByText(">"));

    await waitFor(() =>
      expect(getMovies).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, size: 14 }),
      ),
    );
  });
});
