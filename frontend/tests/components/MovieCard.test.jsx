import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import MovieCard from "@/components/MovieCard/MovieCard";

function LocationDisplay() {
  const location = useLocation();

  return <p data-testid="location">{location.pathname}</p>;
}

const baseMovie = {
  id: 1,
  title: "Peli A",
  poster_url: null,
  watched_by: { watcher_users: 0, total_users: 2, watch_events: [] },
};

function renderCard(movie = baseMovie, props = {}) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<MovieCard movie={movie} {...props} />} />
        <Route path="/movies/:id" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("MovieCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra el título cuando no hay póster", () => {
    const { container } = renderCard();

    expect(screen.getByText("Peli A")).toBeTruthy();
    expect(container.querySelector(".movie-card.skeleton")).toBeNull();
  });

  it("navega al detalle al hacer clic en la card", () => {
    renderCard();

    fireEvent.click(screen.getByText("Peli A"));

    expect(screen.getByTestId("location").textContent).toBe("/movies/1");
  });

  it("mantiene el póster oculto con skeleton hasta que carga", () => {
    const movie = { ...baseMovie, poster_url: "pic.png" };
    const { container } = renderCard(movie);
    const img = container.querySelector("img");

    expect(img.style.display).toBe("none");
    expect(
      container.querySelector(".movie-card").classList.contains("skeleton"),
    ).toBe(true);

    fireEvent.load(img);

    expect(img.style.display).toBe("block");
    expect(
      container.querySelector(".movie-card").classList.contains("skeleton"),
    ).toBe(false);
  });

  it("no muestra ícono de vistas si nadie la vio", () => {
    const { container } = renderCard();

    expect(container.querySelector(".movie-card-icon")).toBeNull();
  });

  it("muestra ícono a medias si la vio parte de los usuarios", () => {
    const movie = {
      ...baseMovie,
      watched_by: { watcher_users: 1, total_users: 2, watch_events: [] },
    };
    const { container } = renderCard(movie);

    expect(container.querySelector(".movie-card-icon")).toBeTruthy();
    expect(screen.getByText("Al menos uno la ha visto")).toBeTruthy();
  });

  it("muestra ícono lleno si todos la vieron", () => {
    const movie = {
      ...baseMovie,
      watched_by: { watcher_users: 2, total_users: 2, watch_events: [] },
    };
    const { container } = renderCard(movie);

    expect(container.querySelector(".movie-card-icon")).toBeTruthy();
    expect(screen.getByText("Todos la han visto")).toBeTruthy();
  });

  it("en modo selección, clickear llama onToggleSelection y no navega", () => {
    const onToggleSelection = vi.fn();
    renderCard(baseMovie, { isSelectionMode: true, onToggleSelection });

    fireEvent.click(screen.getByText("Peli A"));

    expect(onToggleSelection).toHaveBeenCalledWith(1);
    expect(screen.queryByTestId("location")).toBeNull();
  });

  it("en modo selección, marca la card seleccionada con clase y aria-checked", () => {
    const { container } = renderCard(baseMovie, {
      isSelectionMode: true,
      isSelected: true,
      onToggleSelection: vi.fn(),
    });

    const card = container.querySelector(".movie-card");

    expect(card.classList.contains("movie-card--selected")).toBe(true);
    expect(card.getAttribute("role")).toBe("checkbox");
    expect(card.getAttribute("aria-checked")).toBe("true");
  });
});
