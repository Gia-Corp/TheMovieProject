import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ConfirmationModal from "@/components/modals/ConfirmationModal/ConfirmationModal";

function renderModal(overrides = {}) {
  const props = {
    title: "¿Eliminar peli?",
    rejectText: "No",
    confirmText: "Sí, eliminar",
    onReject: vi.fn(),
    onConfirm: vi.fn(),
    isLoading: false,
    ...overrides,
  };
  const ref = createRef();

  const { container } = render(<ConfirmationModal ref={ref} {...props} />);

  return { ...props, ref, container };
}

describe("ConfirmationModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("renderiza el título y los textos de los botones", () => {
    renderModal();

    expect(screen.getByText("¿Eliminar peli?")).toBeTruthy();
    expect(screen.getByText("No")).toBeTruthy();
    expect(screen.getByText("Sí, eliminar")).toBeTruthy();
  });

  it("llama a onReject y onConfirm", () => {
    const { onReject, onConfirm } = renderModal();

    fireEvent.click(screen.getByText("No"));
    expect(onReject).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Sí, eliminar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("deshabilita la confirmación mientras carga", () => {
    const { container } = renderModal({ isLoading: true });

    expect(container.querySelector("button.primary-button").disabled).toBe(true);
    expect(container.querySelector(".spinner-icon")).toBeTruthy();
  });

  it("expone el dialog a través del ref", () => {
    const { ref } = renderModal();

    expect(ref.current.tagName).toBe("DIALOG");
  });
});
