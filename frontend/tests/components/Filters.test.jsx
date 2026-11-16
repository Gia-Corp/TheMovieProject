import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import Filters from "@/components/Filters/Filters";

const emptyFilters = { title: "", director: "", year: "", genre: "" };

describe("Filters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("muestra los cuatro controles, con el título primero", () => {
    render(<Filters filters={emptyFilters} onChange={vi.fn()} />);

    const textInputs = screen.getAllByRole("textbox");
    expect(textInputs.map((input) => input.name)).toEqual(["title", "director"]);
    expect(screen.getByLabelText("Año")).toBeTruthy();
    expect(screen.getByLabelText("Género")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Todos" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Drama" })).toBeTruthy();
  });

  it("llama onChange con el género al instante", () => {
    const onChange = vi.fn();
    render(<Filters filters={emptyFilters} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Género"), {
      target: { value: "Drama" },
    });

    expect(onChange).toHaveBeenCalledWith("genre", "Drama");
  });

  it("hace debounce del título y usa el último valor", () => {
    const onChange = vi.fn();
    render(<Filters filters={emptyFilters} onChange={onChange} />);

    const input = screen.getByLabelText("Título");
    fireEvent.change(input, { target: { value: "Mat" } });
    fireEvent.change(input, { target: { value: "Matrix" } });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("title", "Matrix");
  });

  it("hace debounce del director y usa el último valor", () => {
    const onChange = vi.fn();
    render(<Filters filters={emptyFilters} onChange={onChange} />);

    const input = screen.getByLabelText("Director");
    fireEvent.change(input, { target: { value: "N" } });
    fireEvent.change(input, { target: { value: "Nolan" } });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("director", "Nolan");
  });

  it("hace debounce del año y usa el último valor", () => {
    const onChange = vi.fn();
    render(<Filters filters={emptyFilters} onChange={onChange} />);

    const input = screen.getByLabelText("Año");
    fireEvent.change(input, { target: { value: "20" } });
    fireEvent.change(input, { target: { value: "2024" } });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("year", "2024");
  });

  it("avisa cuando se limpia un filtro", () => {
    const onChange = vi.fn();
    render(
      <Filters
        filters={{ title: "", director: "Nolan", year: "2010", genre: "Drama" }}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Director"), {
      target: { value: "" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onChange).toHaveBeenCalledWith("director", "");
  });
});
