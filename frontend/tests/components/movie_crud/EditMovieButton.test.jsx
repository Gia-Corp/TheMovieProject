import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { AuthContext } from "@/hooks/useAuth";
import { RepositoriesContext } from "@/hooks/useRepos";
import EditMovieButton from "@/components/movie_crud/EditMovieButton/EditMovieButton";

const movie = {
  id: 1,
  title: "Peli A",
  director: "Dir",
  year: 2000,
  runtime: "120 min",
  plot: "Sinopsis",
};

function renderButton({ updateMovie = vi.fn(), onEdit = vi.fn() } = {}) {
  render(
    <AuthContext.Provider
      value={{
        accessToken: "token-1",
        currentUser: { id: "u1" },
        setAccessToken: vi.fn(),
        setCurrentUser: vi.fn(),
      }}
    >
      <RepositoriesContext.Provider value={{ movieRepo: { updateMovie } }}>
        <EditMovieButton movie={movie} onEdit={onEdit} />
      </RepositoriesContext.Provider>
    </AuthContext.Provider>,
  );

  return { updateMovie, onEdit };
}

describe("EditMovieButton", () => {
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

  it("muestra el botón Editar", () => {
    renderButton();

    expect(screen.getByText("Editar")).toBeTruthy();
  });

  it("abre el modal con el formulario al hacer clic", () => {
    renderButton();

    fireEvent.click(screen.getByText("Editar"));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getByText("Editar peli")).toBeTruthy();
    expect(screen.getByLabelText("Título")).toBeTruthy();
  });

  it("envía los cambios y llama a onEdit con la película editada", async () => {
    const editedMovie = { ...movie, title: "Nueva" };
    const updateMovie = vi.fn().mockResolvedValue(editedMovie);
    const onEdit = vi.fn();
    renderButton({ updateMovie, onEdit });

    fireEvent.click(screen.getByText("Editar"));
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Nueva" },
    });
    fireEvent.submit(screen.getByText("Confirmar").closest("form"));

    await waitFor(() =>
      expect(updateMovie).toHaveBeenCalledWith(
        1,
        { title: "Nueva" },
        "token-1",
      ),
    );
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(editedMovie));
  });
});
