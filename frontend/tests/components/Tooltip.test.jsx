import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Tooltip from "@/components/Tooltip/Tooltip";

describe("Tooltip", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza el disparador y el contenido", () => {
    render(
      <Tooltip content="Ayuda">
        <button>Hover</button>
      </Tooltip>,
    );

    expect(screen.getByText("Hover")).toBeTruthy();
    expect(screen.getByText("Ayuda")).toBeTruthy();
  });

  it("usa nowrap por defecto y lo quita cuando nowrap es false", () => {
    const { container, rerender } = render(
      <Tooltip content="Ayuda">
        <span>x</span>
      </Tooltip>,
    );

    expect(
      container.querySelector(".tooltip").classList.contains("tooltip--nowrap"),
    ).toBe(true);

    rerender(
      <Tooltip content="Ayuda" nowrap={false}>
        <span>x</span>
      </Tooltip>,
    );

    expect(
      container.querySelector(".tooltip").classList.contains("tooltip--nowrap"),
    ).toBe(false);
  });
});
