import { afterEach, describe, expect, it } from "vitest";
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

function renderCard(movie = baseMovie) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<MovieCard movie={movie} />} />
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
});
