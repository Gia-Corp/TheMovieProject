import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Paginator from "@/components/pagination/Paginator";

describe("Paginator", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra un spinner deshabilitado si no hay páginas", () => {
    const { container } = render(
      <Paginator
        currentPage={1}
        totalPages={0}
        handlePageSelection={vi.fn()}
      />,
    );

    expect(container.querySelector("button").disabled).toBe(true);
    expect(container.querySelector(".spinner-icon")).toBeTruthy();
  });

  it("renderiza las páginas y deshabilita la actual", () => {
    render(
      <Paginator
        currentPage={1}
        totalPages={2}
        handlePageSelection={vi.fn()}
      />,
    );

    expect(screen.getByText("1").closest("button").disabled).toBe(true);
    expect(screen.getByText("2").closest("button").disabled).toBe(false);
  });

  it("llama a handlePageSelection al elegir otra página", () => {
    const handlePageSelection = vi.fn();
    render(
      <Paginator
        currentPage={1}
        totalPages={2}
        handlePageSelection={handlePageSelection}
      />,
    );

    fireEvent.click(screen.getByText("2"));

    expect(handlePageSelection).toHaveBeenCalledWith(2);
  });

  it("muestra primera, última y elipsis cuando hay muchas páginas", () => {
    const handlePageSelection = vi.fn();
    render(
      <Paginator
        currentPage={5}
        totalPages={10}
        handlePageSelection={handlePageSelection}
      />,
    );

    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getAllByText("...").length).toBe(2);

    fireEvent.click(screen.getByText("1"));
    expect(handlePageSelection).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("10"));
    expect(handlePageSelection).toHaveBeenCalledWith(10);
  });

  it("agrega la clase disabled al contenedor", () => {
    const { container } = render(
      <Paginator
        currentPage={1}
        totalPages={2}
        disabled
        handlePageSelection={vi.fn()}
      />,
    );

    expect(
      container.querySelector(".paginator").classList.contains("disabled"),
    ).toBe(true);
  });
});
