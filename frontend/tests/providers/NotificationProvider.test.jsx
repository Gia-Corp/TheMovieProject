import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { useNotification } from "@/hooks/useNotification";

const NOTIFICATION_TIMEOUT = 5000;

function NotifyProbe() {
  const { notify } = useNotification();
  return (
    <button type="button" onClick={() => notify("Peli agregada exitosamente!")}>
      avisar
    </button>
  );
}

describe("NotificationProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("muestra la notificacion y la cierra tras 5 segundos", () => {
    render(
      <NotificationProvider>
        <NotifyProbe />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByText("avisar"));

    expect(screen.getByText("Peli agregada exitosamente!")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(NOTIFICATION_TIMEOUT);
    });

    expect(screen.queryByText("Peli agregada exitosamente!")).toBeNull();
  });
});
