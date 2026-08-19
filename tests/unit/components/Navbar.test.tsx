import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../../src/components/Navbar";
import "../../../src/i18n";

describe("Navbar", () => {
  it("renders the three navigation links", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /convert/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });

  it("marks the current route's link as active", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveClass("bg-brand-500/10");
    expect(screen.getByRole("link", { name: /home/i })).not.toHaveClass("bg-brand-500/10");
  });

  it("only marks Home active on the exact root path (end match)", () => {
    render(
      <MemoryRouter initialEntries={["/convert"]}>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /home/i })).not.toHaveClass("bg-brand-500/10");
    expect(screen.getByRole("link", { name: /convert/i })).toHaveClass("bg-brand-500/10");
  });

  it("renders the VERT Desktop brand", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByText("VERT")).toBeInTheDocument();
    expect(screen.getByText("Desktop")).toBeInTheDocument();
  });
});
