import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import SearchBar from "@/components/navigation/SearchBar/SearchBar";

function renderSearchBar(overrides = {}) {
  const props = {
    name: "movie-search",
    placeholder: "¿Qué peli buscás?",
    searchCall: vi.fn().mockResolvedValue([]),
    renderItem: (item) => <span>{item.title}</span>,
    onItemClick: vi.fn(),
    ...overrides,
  };

  render(<SearchBar {...props} />);

  return props;
}

async function typeAndWait(input, value) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
}

describe("SearchBar", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renderiza el input con placeholder y nombre", () => {
    renderSearchBar();

    const input = screen.getByPlaceholderText("¿Qué peli buscás?");
    expect(input.getAttribute("name")).toBe("movie-search");
  });

  it("busca con debounce y muestra los resultados", async () => {
    vi.useFakeTimers();
    const searchCall = vi
      .fn()
      .mockResolvedValue([{ id: 1, title: "Peli A" }]);
    renderSearchBar({ searchCall });

    const input = screen.getByPlaceholderText("¿Qué peli buscás?");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "peli" } });

    expect(searchCall).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(searchCall).toHaveBeenCalledWith("peli");
    expect(screen.getByText("Peli A")).toBeTruthy();
  });

  it("llama a onItemClick al elegir un resultado", async () => {
    vi.useFakeTimers();
    const onItemClick = vi.fn();
    const searchCall = vi
      .fn()
      .mockResolvedValue([{ id: 1, title: "Peli A" }]);
    renderSearchBar({ searchCall, onItemClick });

    const input = screen.getByPlaceholderText("¿Qué peli buscás?");
    await typeAndWait(input, "peli");

    fireEvent.mouseDown(screen.getByText("Peli A"));

    expect(onItemClick).toHaveBeenCalledWith({ id: 1, title: "Peli A" });
  });

  it("muestra 'No hay resultados' si la búsqueda no devuelve nada", async () => {
    vi.useFakeTimers();
    renderSearchBar({ searchCall: vi.fn().mockResolvedValue([]) });

    const input = screen.getByPlaceholderText("¿Qué peli buscás?");
    await typeAndWait(input, "zzz");

    expect(screen.getByText("No hay resultados")).toBeTruthy();
  });

  it("limpia los resultados al vaciar el input", async () => {
    vi.useFakeTimers();
    const searchCall = vi
      .fn()
      .mockResolvedValue([{ id: 1, title: "Peli A" }]);
    renderSearchBar({ searchCall });

    const input = screen.getByPlaceholderText("¿Qué peli buscás?");
    await typeAndWait(input, "peli");
    expect(screen.getByText("Peli A")).toBeTruthy();

    fireEvent.change(input, { target: { value: "" } });

    expect(screen.queryByText("Peli A")).toBeNull();
  });
});
