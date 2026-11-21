import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SelectionFab from "@/components/SelectionFab/SelectionFab";

describe("SelectionFab", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra el conteo y llama onConfirm", () => {
    const onConfirm = vi.fn();

    render(
      <SelectionFab
        selectedCount={3}
        isLoading={false}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Marcar 3 películas como vistas",
      }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("usa el singular cuando hay una sola película", () => {
    render(
      <SelectionFab selectedCount={1} isLoading={false} onConfirm={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "Marcar 1 película como vista" }),
    ).toBeTruthy();
  });

  it("se deshabilita mientras confirma", () => {
    render(
      <SelectionFab selectedCount={1} isLoading onConfirm={vi.fn()} />,
    );

    expect(screen.getByRole("button").disabled).toBe(true);
  });
});
