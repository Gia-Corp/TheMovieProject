import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/error_handling/ErrorBoundary";
import { AuthContext } from "@/hooks/useAuth";
import { RepositoriesContext } from "@/hooks/useRepos";
import { NotificationContext } from "@/hooks/useNotification";
import MovieDetail from "@/pages/MovieDetail/MovieDetail";

const movie = {
  id: 1,
  title: "Peli A",
  plot: "Sinopsis de la peli.",
  poster_url: null,
  runtime: "120 min",
  year: 2000,
  director: "Dir",
  watched_by: { watch_events: [] },
};

function renderMovieDetail({
  accessToken = "token-1",
  currentUser = { id: "u1" },
  movie: movieProp = movie,
} = {}) {
  const getMovie = vi.fn().mockResolvedValue(movieProp);
  const updateWatchEvents = vi.fn().mockResolvedValue([{ user: { id: "u1" } }]);
  const deleteMovie = vi.fn();

  render(
    <MemoryRouter initialEntries={[{ pathname: "/movies/1", state: { movie: movieProp } }]}>
      <AuthContext.Provider
        value={{
          accessToken,
          currentUser,
          setAccessToken: vi.fn(),
          setCurrentUser: vi.fn(),
        }}
      >
        <RepositoriesContext.Provider
          value={{ movieRepo: { getMovie, updateWatchEvents, deleteMovie } }}
        >
          <NotificationContext.Provider value={{ notify: vi.fn() }}>
            <ErrorBoundary>
              <Routes>
                <Route path="/movies/:id" element={<MovieDetail />} />
              </Routes>
            </ErrorBoundary>
          </NotificationContext.Provider>
        </RepositoriesContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  return { getMovie, updateWatchEvents, deleteMovie };
}

describe("MovieDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("muestra el spinner mientras carga la película", () => {
    const getMovie = vi.fn(() => new Promise(() => {}));

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: "/movies/1" }]}>
        <AuthContext.Provider
          value={{
            accessToken: "token-1",
            currentUser: { id: "u1" },
            setAccessToken: vi.fn(),
            setCurrentUser: vi.fn(),
          }}
        >
          <RepositoriesContext.Provider value={{ movieRepo: { getMovie } }}>
            <ErrorBoundary>
              <Routes>
                <Route path="/movies/:id" element={<MovieDetail />} />
              </Routes>
            </ErrorBoundary>
          </RepositoriesContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(container.querySelector(".spinner-container")).toBeTruthy();
  });

  it("renderiza los datos del detalle cuando la película ya trae datos", async () => {
    renderMovieDetail();

    expect(await screen.findByText("Peli A")).toBeTruthy();
    expect(screen.getByText("Sinopsis de la peli.")).toBeTruthy();
    expect(screen.getByText("120 min")).toBeTruthy();
    expect(screen.getByText("2000")).toBeTruthy();
    expect(screen.getByText("Dir")).toBeTruthy();
    expect(screen.getByText("No tiene poster :/")).toBeTruthy();
  });

  it("togglea el estado watched con updateWatchEvents y cambia el texto", async () => {
    const { updateWatchEvents } = renderMovieDetail();

    expect(await screen.findByText("No la viste aún")).toBeTruthy();

    fireEvent.click(document.querySelector(".movie-watched-button"));

    expect(updateWatchEvents).toHaveBeenCalledWith(1, ["u1"], "token-1");
    expect(await screen.findByText("Ya la viste")).toBeTruthy();
  });

  it("revierte el estado watched si updateWatchEvents falla", async () => {
    const { updateWatchEvents } = renderMovieDetail();
    updateWatchEvents.mockRejectedValue(new Error("Fallo update"));

    expect(await screen.findByText("No la viste aún")).toBeTruthy();

    fireEvent.click(document.querySelector(".movie-watched-button"));

    await waitFor(() =>
      expect(screen.getByText("No la viste aún")).toBeTruthy(),
    );
  });

  it("deshabilita el botón watched y no muestra acciones con acceso", async () => {
    renderMovieDetail({ accessToken: null, currentUser: { id: "u1" } });

    expect(await screen.findByText("No la viste aún")).toBeTruthy();
    expect(document.querySelector(".movie-watched-button").disabled).toBe(true);
    expect(screen.queryByText("Editar")).toBeNull();
    expect(screen.queryByText("Eliminar")).toBeNull();
  });

  it("lanza el error cuando la carga falla", async () => {
    const getMovie = vi.fn().mockRejectedValue(new Error("Fallo red"));

    render(
      <MemoryRouter initialEntries={[{ pathname: "/movies/1" }]}>
        <AuthContext.Provider
          value={{
            accessToken: "token-1",
            currentUser: { id: "u1" },
            setAccessToken: vi.fn(),
            setCurrentUser: vi.fn(),
          }}
        >
          <RepositoriesContext.Provider value={{ movieRepo: { getMovie } }}>
            <ErrorBoundary>
              <Routes>
                <Route path="/movies/:id" element={<MovieDetail />} />
              </Routes>
            </ErrorBoundary>
          </RepositoriesContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/Algo salió mal/)).toBeTruthy());
  });
});
