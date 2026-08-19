import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { open } from "@tauri-apps/plugin-dialog";
import Convert from "../../../src/pages/Convert";
import { useAppStore } from "../../../src/store";
import type { ConvertFile } from "../../../src/converters/types";
import "../../../src/i18n";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

const file: ConvertFile = {
  id: "1",
  filePath: "/a.png",
  name: "a.png",
  sizeBytes: 100,
  extension: "png",
  category: "image",
  targetFormat: "webp",
  status: "idle",
  progress: 0,
};

function renderConvert() {
  return render(
    <MemoryRouter>
      <Convert />
    </MemoryRouter>,
  );
}

describe("Convert page", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    vi.mocked(open).mockReset();
    useAppStore.setState({ files: [], toasts: [] });
  });

  it("redirects to home when there are no files", () => {
    renderConvert();
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("renders nothing while redirecting", () => {
    const { container } = renderConvert();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a FileCard for each file instead of redirecting", () => {
    useAppStore.setState({ files: [file] });
    renderConvert();
    expect(navigateMock).not.toHaveBeenCalled();
    expect(screen.getByText("a.png")).toBeInTheDocument();
  });

  it("renders the add files button", () => {
    useAppStore.setState({ files: [file] });
    renderConvert();
    expect(screen.getByText("Add files to get started")).toBeInTheDocument();
  });

  it("renders the conversion panel toolbar", () => {
    useAppStore.setState({ files: [file] });
    renderConvert();
    expect(screen.getByText("Convert All")).toBeInTheDocument();
  });

  it("adds more files when the picker returns a selection", async () => {
    useAppStore.setState({ files: [file] });
    vi.mocked(open).mockResolvedValue(["/b.mp3"]);

    renderConvert();
    fireEvent.click(screen.getByText("Add files to get started"));

    await waitFor(() => expect(useAppStore.getState().files).toHaveLength(2));
  });

  it("wraps a single selected path into an array", async () => {
    useAppStore.setState({ files: [file] });
    vi.mocked(open).mockResolvedValue("/b.mp3");

    renderConvert();
    fireEvent.click(screen.getByText("Add files to get started"));

    await waitFor(() => expect(useAppStore.getState().files).toHaveLength(2));
  });

  it("does not add files when the picker is cancelled", async () => {
    useAppStore.setState({ files: [file] });
    vi.mocked(open).mockResolvedValue(null);

    renderConvert();
    fireEvent.click(screen.getByText("Add files to get started"));

    await waitFor(() => expect(open).toHaveBeenCalled());
    expect(useAppStore.getState().files).toHaveLength(1);
  });
});
