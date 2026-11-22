import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/error_handling/ErrorBoundary";
import { AuthContext } from "@/hooks/useAuth";
import { NotificationContext } from "@/hooks/useNotification";
import { RepositoriesContext } from "@/hooks/useRepos";
import { SelectionProvider } from "@/providers/SelectionProvider";
import Home from "@/pages/Home/Home";

function AppLikeHome() {
  const location = useLocation();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ErrorBoundary key={location.pathname}>
            <Home />
          </ErrorBoundary>
        }
      />
    </Routes>
  );
}

const movie = {
  id: 1,
  title: "Peli A",
  poster_url: null,
  watched_by: { watcher_users: 0, total_users: 0, watch_events: [] },
};

function renderHome({
  getMovies = vi.fn(),
  updateWatchedMovies = vi.fn(),
  accessToken = null,
  notify = vi.fn(),
  initialEntries = ["/?page=1"],
  withErrorBoundary = false,
  withRoute = false,
} = {}) {
  const home = withRoute ? (
    <AppLikeHome />
  ) : withErrorBoundary ? (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  ) : (
    <Home />
  );

  const result = render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthContext.Provider
        value={{
          accessToken,
          currentUser: accessToken ? { id: "u1" } : null,
          setAccessToken: vi.fn(),
          setCurrentUser: vi.fn(),
        }}
      >
        <SelectionProvider>
          <RepositoriesContext.Provider
            value={{
              movieRepo: { getMovies },
              userRepo: { updateWatchedMovies },
            }}
          >
            <NotificationContext.Provider value={{ notify }}>
              {home}
            </NotificationContext.Provider>
          </RepositoriesContext.Provider>
        </SelectionProvider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  return { ...result, getMovies, updateWatchedMovies, notify };
}

describe("Home", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("muestra el spinner y los skeletons mientras carga", () => {
    const getMovies = vi.fn(() => new Promise(() => {}));

    const { container } = renderHome({ getMovies });

    expect(container.querySelectorAll(".movie-card.skeleton").length).toBe(14);
  });

  it("pide la página actual y renderiza las películas al cargarse", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({ getMovies });

    expect(await screen.findByText("Peli A")).toBeTruthy();
    expect(getMovies).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, size: 14 }),
    );
    expect(getMovies.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
  });

  it("lanza el error cuando la carga falla", async () => {
    const getMovies = vi.fn().mockRejectedValue(new Error("Fallo red"));

    renderHome({ getMovies, withErrorBoundary: true });

    await waitFor(() =>
      expect(screen.getByText(/Algo salió mal/)).toBeTruthy(),
    );
  });

  it("muestra un mensaje cuando ningún resultado cumple los filtros", async () => {
    const getMovies = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("No movies found"), { status: 404 }),
      );

    renderHome({
      getMovies,
      initialEntries: ["/?page=1&title=zzz"],
    });

    expect(
      await screen.findByText("No hay pelis que coincidan con los filtros"),
    ).toBeTruthy();
    expect(screen.getByLabelText("Título")).toBeTruthy();
    expect(screen.queryByText(/Algo salió mal/)).toBeNull();
  });

  it("recupera la grilla al cambiar el filtro después de un 404", async () => {
    const getMovies = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("No movies found"), { status: 404 }),
      )
      .mockResolvedValue({ movies: [movie], metadata: { page_count: 1 } });

    renderHome({
      getMovies,
      initialEntries: ["/?page=1&title=zzz"],
    });

    expect(
      await screen.findByText("No hay pelis que coincidan con los filtros"),
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Género"), {
      target: { value: "Drama" },
    });

    expect(await screen.findByText("Peli A")).toBeTruthy();
    expect(
      screen.queryByText("No hay pelis que coincidan con los filtros"),
    ).toBeNull();
  });

  it("muestra los filtros de título, director, año y género", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({ getMovies });

    expect(await screen.findByLabelText("Título")).toBeTruthy();
    expect(screen.getByLabelText("Director")).toBeTruthy();
    expect(screen.getByLabelText("Año")).toBeTruthy();
    expect(screen.getByLabelText("Género")).toBeTruthy();
  });

  it("pasa los filtros de la URL al repositorio", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({
      getMovies,
      initialEntries: [
        "/?page=2&title=Matrix&director=Nolan&year=2010&genre=Drama",
      ],
    });

    expect(await screen.findByText("Peli A")).toBeTruthy();
    expect(getMovies).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        size: 14,
        title: "Matrix",
        director: "Nolan",
        year: "2010",
        genre: "Drama",
      }),
    );
  });

  it("al cambiar el género filtra y vuelve a la página 1", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 2 },
    });

    renderHome({
      getMovies,
      initialEntries: ["/?page=2"],
    });

    await screen.findByText("Peli A");
    fireEvent.change(screen.getByLabelText("Género"), {
      target: { value: "Drama" },
    });

    await waitFor(() =>
      expect(getMovies).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, size: 14, genre: "Drama" }),
      ),
    );
  });

  it("filtra por título luego del debounce", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({ getMovies });

    await screen.findByText("Peli A");
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "harry" },
    });

    await waitFor(
      () =>
        expect(getMovies).toHaveBeenLastCalledWith(
          expect.objectContaining({ page: 1, size: 14, title: "harry" }),
        ),
      { timeout: 2000 },
    );
  });

  it("conserva los filtros al cambiar de página", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 2 },
    });

    renderHome({
      getMovies,
      initialEntries: ["/?page=1&title=Matrix&genre=Drama"],
    });

    await screen.findByText("Peli A");
    fireEvent.click(screen.getByText(">"));

    await waitFor(() =>
      expect(getMovies).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
          size: 14,
          title: "Matrix",
          genre: "Drama",
        }),
      ),
    );
  });

  it("vuelve a pedir la página siguiente al hacer clic en el paginador", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 2 },
    });

    renderHome({ getMovies });

    expect(await screen.findByText("Peli A")).toBeTruthy();
    fireEvent.click(screen.getByText(">"));

    await waitFor(() =>
      expect(getMovies).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2, size: 14 }),
      ),
    );
  });

  it("no muestra el toggle de selección sin sesión", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({ getMovies });

    await screen.findByText("Peli A");

    expect(
      screen.queryByRole("button", {
        name: "Marcar pelis como vistas",
      }),
    ).toBeNull();
  });

  it("muestra el toggle de selección con sesión", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({ getMovies, accessToken: "token-1" });

    expect(
      await screen.findByRole("button", {
        name: "Marcar pelis como vistas",
      }),
    ).toBeTruthy();
  });

  it("muestra el ojo en el toggle y lo oculta al entrar en modo selección", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({ getMovies, accessToken: "token-1" });

    const toggle = await screen.findByRole("button", {
      name: "Marcar pelis como vistas",
    });
    expect(toggle.querySelector(".selection-mode-toggle-icon")).toBeTruthy();

    fireEvent.click(toggle);

    const activeToggle = screen.getByRole("button", {
      name: "Cancelar selección",
    });
    expect(activeToggle.querySelector(".selection-mode-toggle-icon")).toBeNull();
  });

  it("en modo selección, clickear una card la selecciona y muestra el FAB", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });

    renderHome({ getMovies, accessToken: "token-1" });

    await screen.findByText("Peli A");
    fireEvent.click(
      screen.getByRole("button", { name: "Marcar pelis como vistas" }),
    );
    fireEvent.click(screen.getByText("Peli A"));

    expect(
      screen.getByRole("button", { name: "Marcar 1 película como vista" }),
    ).toBeTruthy();
  });

  it("confirma la selección llamando al endpoint y notificando", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 1 },
    });
    const updateWatchedMovies = vi.fn().mockResolvedValue({
      success: [{ movie_id: 1, title: "Peli A", watched: true }],
      errors: [],
    });
    const notify = vi.fn();

    renderHome({
      getMovies,
      updateWatchedMovies,
      accessToken: "token-1",
      notify,
    });

    await screen.findByText("Peli A");
    fireEvent.click(
      screen.getByRole("button", { name: "Marcar pelis como vistas" }),
    );
    fireEvent.click(screen.getByText("Peli A"));
    fireEvent.click(
      screen.getByRole("button", { name: "Marcar 1 película como vista" }),
    );

    await waitFor(() =>
      expect(updateWatchedMovies).toHaveBeenCalledWith(
        [{ movie_id: 1, watched: true }],
        "token-1",
      ),
    );
    expect(notify).toHaveBeenCalledWith("1 peli marcada como vista");

    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: "Marcar 1 película como vista",
        }),
      ).toBeNull(),
    );
  });

  it("mantiene el modo selección y las pelis seleccionadas al cambiar de página", async () => {
    const movie2 = { ...movie, id: 2, title: "Peli B" };
    const getMovies = vi.fn(({ page }) =>
      Promise.resolve({
        movies: page === 1 ? [movie] : [movie2],
        metadata: { page_count: 2 },
      }),
    );

    renderHome({ getMovies, accessToken: "token-1" });

    await screen.findByText("Peli A");
    fireEvent.click(
      screen.getByRole("button", { name: "Marcar pelis como vistas" }),
    );
    fireEvent.click(screen.getByText("Peli A"));

    fireEvent.click(screen.getByText(">"));

    expect(await screen.findByText("Peli B")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Cancelar selección" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Marcar 1 película como vista" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByText("<"));

    expect(await screen.findByText("Peli A")).toBeTruthy();
    expect(
      screen.getByText("Peli A").closest(".movie-card").classList,
    ).toContain("movie-card--selected");
  });

  it("mantiene la selección con la estructura de rutas de App", async () => {
    const getMovies = vi.fn().mockResolvedValue({
      movies: [movie],
      metadata: { page_count: 2 },
    });

    renderHome({ getMovies, accessToken: "token-1", withRoute: true });

    await screen.findByText("Peli A");
    fireEvent.click(
      screen.getByRole("button", { name: "Marcar pelis como vistas" }),
    );
    fireEvent.click(screen.getByText("Peli A"));
    fireEvent.click(screen.getByText(">"));

    await waitFor(() =>
      expect(getMovies).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 }),
      ),
    );
    expect(
      screen.getByRole("button", { name: "Cancelar selección" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Marcar 1 película como vista" }),
    ).toBeTruthy();
  });
});
