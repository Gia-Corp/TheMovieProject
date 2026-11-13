import { describe, expect, it, vi } from "vitest";
import { UserRepository } from "@/repositories/UserRepository";

function makeResponse(body) {
  return { json: async () => body };
}

describe("UserRepository", () => {
  it("getUser arma el path con el id y manda el Authorization", async () => {
    const apiFetch = vi.fn().mockResolvedValue(
      makeResponse({ id: "u1", nickname: "saul" }),
    );
    const repo = new UserRepository(apiFetch);

    const res = await repo.getUser("u1", "token-123");

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [url, options] = apiFetch.mock.calls[0];
    expect(url.pathname).toBe("/api/users/u1");
    expect(options.headers.Authorization).toBe("Bearer token-123");
    expect(res.nickname).toBe("saul");
  });
});
