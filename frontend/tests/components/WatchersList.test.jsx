import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import WatchersList from "@/components/WatchersList/WatchersList";

describe("WatchersList", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra el mensaje vacío cuando no hay watchers", () => {
    render(<WatchersList watchers={[]} />);

    expect(screen.getByText("Nadie la ha visto")).toBeTruthy();
  });

  it("lista los watchers con nickname y foto", () => {
    render(
      <WatchersList
        watchers={[
          { user: { id: "u1", nickname: "saul", profile_pic: "pic1.png" } },
          { user: { id: "u2", nickname: "ana", profile_pic: "pic2.png" } },
        ]}
      />,
    );

    expect(screen.getByText("Vista por:")).toBeTruthy();
    expect(screen.getByText("saul")).toBeTruthy();
    expect(screen.getByText("ana")).toBeTruthy();

    const images = document.querySelectorAll(".watchers-list-item img");
    expect(images.length).toBe(2);
    expect(images[0].getAttribute("src")).toBe("pic1.png");
  });
});
