import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../../src/store";

function makeFile(name: string, size = 1024): File {
  return new File(["content"], name, { type: "application/octet-stream", lastModified: 0 });
}

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      files: [],
      toasts: [],
      settings: useAppStore.getState().settings,
    });
  });

  describe("addFiles", () => {
    it("adds supported files", () => {
      const { addFiles } = useAppStore.getState();
      addFiles([makeFile("photo.png"), makeFile("song.mp3")]);
      expect(useAppStore.getState().files).toHaveLength(2);
    });

    it("skips unsupported files", () => {
      const { addFiles } = useAppStore.getState();
      addFiles([makeFile("archive.tar.gz"), makeFile("photo.png")]);
      expect(useAppStore.getState().files).toHaveLength(1);
    });

    it("assigns correct category", () => {
      const { addFiles } = useAppStore.getState();
      addFiles([makeFile("photo.png"), makeFile("song.mp3"), makeFile("movie.mp4")]);
      const files = useAppStore.getState().files;
      expect(files.find((f) => f.name === "photo.png")?.category).toBe("image");
      expect(files.find((f) => f.name === "song.mp3")?.category).toBe("audio");
      expect(files.find((f) => f.name === "movie.mp4")?.category).toBe("video");
    });

    it("assigns unique ids", () => {
      const { addFiles } = useAppStore.getState();
      addFiles([makeFile("a.png"), makeFile("b.png"), makeFile("c.png")]);
      const ids = useAppStore.getState().files.map((f) => f.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(3);
    });
  });

  describe("removeFile", () => {
    it("removes a file by id", () => {
      const { addFiles, removeFile } = useAppStore.getState();
      addFiles([makeFile("photo.png")]);
      const { files } = useAppStore.getState();
      removeFile(files[0].id);
      expect(useAppStore.getState().files).toHaveLength(0);
    });
  });

  describe("clearFiles", () => {
    it("removes all files", () => {
      const { addFiles, clearFiles } = useAppStore.getState();
      addFiles([makeFile("a.png"), makeFile("b.mp3")]);
      clearFiles();
      expect(useAppStore.getState().files).toHaveLength(0);
    });
  });

  describe("updateFile", () => {
    it("updates specific fields", () => {
      const { addFiles, updateFile } = useAppStore.getState();
      addFiles([makeFile("photo.png")]);
      const id = useAppStore.getState().files[0].id;
      updateFile(id, { status: "converting", progress: 42 });
      const file = useAppStore.getState().files[0];
      expect(file.status).toBe("converting");
      expect(file.progress).toBe(42);
    });
  });

  describe("setTargetFormat", () => {
    it("changes the target format", () => {
      const { addFiles, setTargetFormat } = useAppStore.getState();
      addFiles([makeFile("photo.png")]);
      const id = useAppStore.getState().files[0].id;
      setTargetFormat(id, "webp");
      expect(useAppStore.getState().files[0].targetFormat).toBe("webp");
    });
  });

  describe("addToast", () => {
    it("adds a toast with correct fields", () => {
      const { addToast } = useAppStore.getState();
      addToast("Test message", "success");
      const toasts = useAppStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe("Test message");
      expect(toasts[0].type).toBe("success");
      expect(toasts[0].id).toBeTruthy();
    });
  });

  describe("updateSettings", () => {
    it("merges settings", () => {
      const { updateSettings } = useAppStore.getState();
      updateSettings({ theme: "dark", quality: 80 });
      const { settings } = useAppStore.getState();
      expect(settings.theme).toBe("dark");
      expect(settings.quality).toBe(80);
    });
  });
});
