import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import MovieWatchedButton from "@/components/movie_crud/MovieWatchedButton/MovieWatchedButton";

describe("MovieWatchedButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("llama a onClick al hacer clic", () => {
    const onClick = vi.fn();
    const { container } = render(
      <MovieWatchedButton isWatched={false} onClick={onClick} />,
    );

    fireEvent.click(container.querySelector("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("no llama a onClick si está deshabilitado", () => {
    const onClick = vi.fn();
    const { container } = render(
      <MovieWatchedButton isWatched={false} onClick={onClick} disabled />,
    );
    const button = container.querySelector("button");

    expect(button.disabled).toBe(true);

    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("pinta el ícono con color según isWatched", () => {
    const { container, rerender } = render(
      <MovieWatchedButton isWatched={true} onClick={vi.fn()} />,
    );

    expect(container.querySelector("svg").getAttribute("fill")).toBe(
      "var(--check-clr)",
    );

    rerender(<MovieWatchedButton isWatched={false} onClick={vi.fn()} />);

    expect(container.querySelector("svg").getAttribute("fill")).toBe("grey");
  });
});
