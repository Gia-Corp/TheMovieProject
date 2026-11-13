import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuth } from "@/hooks/useAuth";

function Probe() {
  const { accessToken, currentUser } = useAuth();
  return (
    <div>
      <span data-testid="access-token">{accessToken ?? "none"}</span>
      <span data-testid="user-id">{currentUser?.id ?? "none"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    cleanup();
  });

  it("muestra el spinner mientras refresca la sesión", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));

    const { container } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(container.querySelector(".spinner-container")).toBeTruthy();
    expect(container.querySelector(".spinner-icon")).toBeTruthy();
  });

  it("guarda el access token y el user del refresh exitoso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: "token-1", user: { id: "user-1" } }),
      }),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("access-token").textContent).toBe("token-1"),
    );
    expect(screen.getByTestId("user-id").textContent).toBe("user-1");
  });

  it("limpia la sesión cuando el refresh falla", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Refresh expirado" }),
      }),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("access-token").textContent).toBe("none"),
    );
    expect(screen.getByTestId("user-id").textContent).toBe("none");
  });
});
