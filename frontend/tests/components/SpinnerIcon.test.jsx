import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

describe("SpinnerIcon", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza un svg con la clase spinner-icon", () => {
    const { container } = render(<SpinnerIcon />);

    expect(container.querySelector("svg.spinner-icon")).toBeTruthy();
  });

  it("aplica el tamaño recibido por props", () => {
    const { container } = render(<SpinnerIcon size={30} />);

    expect(container.querySelector("svg").style.width).toBe("30px");
  });
});
