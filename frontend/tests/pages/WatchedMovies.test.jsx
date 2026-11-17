import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ErrorBoundary } from "@/error_handling/ErrorBoundary";
import { AuthContext } from "@/hooks/useAuth";
import { RepositoriesContext } from "@/hooks/useRepos";
import WatchedMovies from "@/pages/WatchedMovies/WatchedMovies";

function renderWatchedMovies(getWatchedMovies) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          accessToken: "token-1",
          currentUser: { id: "u1" },
          setAccessToken: vi.fn(),
          setCurrentUser: vi.fn(),
        }}
      >
        <RepositoriesContext.Provider
          value={{ userRepo: { getWatchedMovies } }}
        >
          <ErrorBoundary>
            <WatchedMovies />
          </ErrorBoundary>
        </RepositoriesContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

const watchedMovies = {
  metadata: { movie_count: 10, movies_watched: 4, last_watched: null },
  movies: [
    {
      movie_id: 2,
      title: "La más reciente",
      year: 2024,
      poster_url: "poster-reciente.jpg",
      watched_at: "2026-11-17 10:00:00.000000",
    },
    {
      movie_id: 1,
      title: "La más vieja",
      year: 2020,
      poster_url: null,
      watched_at: "2026-11-10 09:00:00.000000",
    },
  ],
};

const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");

describe("WatchedMovies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (originalScrollY) {
      Object.defineProperty(window, "scrollY", originalScrollY);
    } else {
      delete window.scrollY;
    }
  });

  it("muestra el spinner mientras carga", () => {
    const getWatchedMovies = vi.fn(() => new Promise(() => {}));

    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            accessToken: "token-1",
            currentUser: { id: "u1" },
            setAccessToken: vi.fn(),
            setCurrentUser: vi.fn(),
          }}
        >
          <RepositoriesContext.Provider
            value={{ userRepo: { getWatchedMovies } }}
          >
            <ErrorBoundary>
              <WatchedMovies />
            </ErrorBoundary>
          </RepositoriesContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(container.querySelector(".spinner-container")).toBeTruthy();
  });

  it("muestra las stats y la lista de películas en el orden que llega", async () => {
    const getWatchedMovies = vi.fn().mockResolvedValue(watchedMovies);

    const { container } = renderWatchedMovies(getWatchedMovies);

    expect(await screen.findByText("4 de 10")).toBeTruthy();
    expect(screen.getByText("40%")).toBeTruthy();

    const rows = container.querySelectorAll(".watched-movie-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain("La más reciente");
    expect(rows[0].textContent).toContain("2024");
    expect(rows[1].textContent).toContain("La más vieja");
    expect(rows[1].textContent).toContain("2020");

    const titleLink = screen.getByRole("link", { name: /La más reciente/ });
    expect(titleLink.getAttribute("href")).toBe("/movies/2");
    expect(rows[0].className).toContain("watched-movie-row--last");
    expect(rows[1].className).not.toContain("watched-movie-row--last");
  });

  it("muestra el botón para volver arriba al scrollear y vuelve al tope", async () => {
    const getWatchedMovies = vi.fn().mockResolvedValue(watchedMovies);
    renderWatchedMovies(getWatchedMovies);

    await screen.findByText("4 de 10");
    expect(screen.queryByRole("button", { name: "Volver arriba" })).toBeNull();

    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    act(() => {
      Object.defineProperty(window, "scrollY", {
        value: 500,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
    });

    const button = screen.getByRole("button", { name: "Volver arriba" });
    fireEvent.click(button);

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("muestra el estado vacío cuando no hay películas vistas", async () => {
    const getWatchedMovies = vi.fn().mockResolvedValue({
      metadata: { movie_count: 0, movies_watched: 0, last_watched: null },
      movies: [],
    });

    renderWatchedMovies(getWatchedMovies);

    expect(await screen.findByText("Aún no has visto películas.")).toBeTruthy();
    expect(screen.getByText("0 de 0")).toBeTruthy();
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("lanza el error cuando la carga falla", async () => {
    const getWatchedMovies = vi
      .fn()
      .mockRejectedValue(new Error("Fallo watched movies"));

    renderWatchedMovies(getWatchedMovies);

    await waitFor(() => expect(screen.getByText(/Algo salió mal/)).toBeTruthy());
  });
});
