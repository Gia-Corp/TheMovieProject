import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ErrorBoundary } from "@/error_handling/ErrorBoundary";
import { AuthContext } from "@/hooks/useAuth";
import { RepositoriesContext } from "@/hooks/useRepos";
import Profile from "@/pages/Profile/Profile";

function renderProfile({ currentUser } = {}) {
  const getUser = vi.fn();

  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          accessToken: "token-1",
          currentUser,
          setAccessToken: vi.fn(),
          setCurrentUser: vi.fn(),
        }}
      >
        <RepositoriesContext.Provider value={{ userRepo: { getUser } }}>
          <ErrorBoundary>
            <Profile />
          </ErrorBoundary>
        </RepositoriesContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

  return { getUser };
}

const fullUser = {
  id: "u1",
  nickname: "saul",
  email: "saul@example.com",
  role: "user",
  profile_pic: "pic.png",
};

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("muestra el spinner mientras carga el usuario", () => {
    const getUser = vi.fn(() => new Promise(() => {}));

    const { container } = render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            accessToken: "token-1",
            currentUser: { id: "u1", email: null, nickname: "saul", role: "user" },
            setAccessToken: vi.fn(),
            setCurrentUser: vi.fn(),
          }}
        >
          <RepositoriesContext.Provider value={{ userRepo: { getUser } }}>
            <ErrorBoundary>
              <Profile />
            </ErrorBoundary>
          </RepositoriesContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(container.querySelector(".spinner-container")).toBeTruthy();
  });

  it("renderiza los datos del usuario cuando ya los trae", async () => {
    const { getUser } = renderProfile({ currentUser: fullUser });

    expect(await screen.findByText("saul")).toBeTruthy();
    expect(screen.getByText(/saul@example.com/)).toBeTruthy();
    expect(screen.getByText("User")).toBeTruthy();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("lanza el error cuando la carga del usuario falla", async () => {
    const getUser = vi.fn().mockRejectedValue(new Error("Fallo user"));

    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            accessToken: "token-1",
            currentUser: { id: "u1", email: null, nickname: "saul", role: "user" },
            setAccessToken: vi.fn(),
            setCurrentUser: vi.fn(),
          }}
        >
          <RepositoriesContext.Provider value={{ userRepo: { getUser } }}>
            <ErrorBoundary>
              <Profile />
            </ErrorBoundary>
          </RepositoriesContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/Algo salió mal/)).toBeTruthy());
  });
});
