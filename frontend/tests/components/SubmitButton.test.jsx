import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SubmitButton from "@/components/SubmitButton/SubmitButton";

describe("SubmitButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra el texto recibido", () => {
    render(<SubmitButton text="Confirmar" />);

    expect(screen.getByText("Confirmar")).toBeTruthy();
  });

  it("muestra el spinner y se deshabilita mientras carga", () => {
    const { container } = render(<SubmitButton text="Confirmar" isLoading />);
    const button = container.querySelector("button");

    expect(button.disabled).toBe(true);
    expect(container.querySelector(".spinner-icon")).toBeTruthy();
    expect(screen.queryByText("Confirmar")).toBeNull();
  });

  it("llama a onClick al hacer clic", () => {
    const onClick = vi.fn();
    render(<SubmitButton text="Confirmar" onClick={onClick} />);

    fireEvent.click(screen.getByText("Confirmar"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
