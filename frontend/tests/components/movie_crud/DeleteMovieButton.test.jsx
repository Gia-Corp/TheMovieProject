import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/hooks/useAuth";
import { RepositoriesContext } from "@/hooks/useRepos";
import { NotificationContext } from "@/hooks/useNotification";
import DeleteMovieButton from "@/components/movie_crud/DeleteMovieButton/DeleteMovieButton";

const movie = { id: 1, title: "Peli A" };

function renderButton({
  deleteMovie = vi.fn().mockResolvedValue(undefined),
  notify = vi.fn(),
  accessToken = "token-1",
} = {}) {
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          accessToken,
          currentUser: { id: "u1" },
          setAccessToken: vi.fn(),
          setCurrentUser: vi.fn(),
        }}
      >
        <RepositoriesContext.Provider value={{ movieRepo: { deleteMovie } }}>
          <NotificationContext.Provider value={{ notify }}>
            <DeleteMovieButton movie={movie} />
          </NotificationContext.Provider>
        </RepositoriesContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  return { deleteMovie, notify };
}

describe("DeleteMovieButton", () => {
  beforeEach(() => {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.setAttribute("open", "");
      };
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function () {
        this.removeAttribute("open");
      };
    }
    vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(
      function () {
        this.setAttribute("open", "");
      },
    );
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(
      function () {
        this.removeAttribute("open");
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra el botón Eliminar", () => {
    renderButton();

    expect(screen.getByText("Eliminar")).toBeTruthy();
  });

  it("abre el modal de confirmación al hacer clic", () => {
    renderButton();

    fireEvent.click(screen.getByText("Eliminar"));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getByText("¿Eliminar peli?")).toBeTruthy();
  });

  it("elimina la película y notifica al confirmar", async () => {
    const { deleteMovie, notify } = renderButton();

    fireEvent.click(screen.getByText("Eliminar"));
    fireEvent.click(screen.getByText("Sí, eliminar"));

    await waitFor(() =>
      expect(deleteMovie).toHaveBeenCalledWith(1, "token-1"),
    );
    expect(notify).toHaveBeenCalledWith('"Peli A" eliminada exitosamente');
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
  });

  it("no elimina si se rechaza la confirmación", () => {
    const { deleteMovie } = renderButton();

    fireEvent.click(screen.getByText("Eliminar"));
    fireEvent.click(screen.getByText("No"));

    expect(deleteMovie).not.toHaveBeenCalled();
  });
});
