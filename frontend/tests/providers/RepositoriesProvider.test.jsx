import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthContext } from "@/hooks/useAuth";
import { useRepos } from "@/hooks/useRepos";
import { RepositoriesProvider } from "@/providers/RepositoriesProvider";

function Probe() {
  const { movieRepo, externalMovieRepo, userRepo } = useRepos();
  return (
    <div>
      <span data-testid="movie-repo">{movieRepo?.constructor.name}</span>
      <span data-testid="external-movie-repo">
        {externalMovieRepo?.constructor.name}
      </span>
      <span data-testid="user-repo">{userRepo?.constructor.name}</span>
    </div>
  );
}

describe("RepositoriesProvider", () => {
  it("provee los repositorios por contexto", () => {
    const authValue = {
      accessToken: "token-1",
      setAccessToken: vi.fn(),
      setCurrentUser: vi.fn(),
      currentUser: { id: "user-1" },
    };

    render(
      <AuthContext.Provider value={authValue}>
        <RepositoriesProvider>
          <Probe />
        </RepositoriesProvider>
      </AuthContext.Provider>,
    );

    expect(screen.getByTestId("movie-repo").textContent).toBe("MovieRepository");
    expect(screen.getByTestId("external-movie-repo").textContent).toBe(
      "ExternalMovieRepository",
    );
    expect(screen.getByTestId("user-repo").textContent).toBe("UserRepository");
  });
});
