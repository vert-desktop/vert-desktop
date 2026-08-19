import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../../../src/pages/Home";
import "../../../src/i18n";

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe("Home", () => {
  it("renders the tagline and subtitle", () => {
    renderHome();
    expect(screen.getByText("Convert anything. Privately.")).toBeInTheDocument();
    expect(
      screen.getByText("All conversions happen locally on your machine — no uploads, no servers."),
    ).toBeInTheDocument();
  });

  it("renders a card for each format category", () => {
    renderHome();
    expect(screen.getByText("Images")).toBeInTheDocument();
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
  });

  it("renders the upload drop zone", () => {
    renderHome();
    expect(screen.getByText("Drop files here")).toBeInTheDocument();
  });
});
