import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConvertFile, AppSettings } from "../converters/types";
import { detectCategory, getDefaultOutputFormat } from "../converters/formats";
import { invoke } from "@tauri-apps/api/core";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "en",
  defaultImageFormat: "png",
  defaultAudioFormat: "mp3",
  defaultVideoFormat: "mp4",
  defaultDocumentFormat: "docx",
  quality: 92,
  audioBitrate: 192,
  sampleRate: 44100,
  preserveMetadata: true,
  useDefaultsAutomatically: false,
};

interface AppState {
  files: ConvertFile[];
  settings: AppSettings;
  toasts: Toast[];
  addFilePaths: (paths: string[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFile: (id: string, patch: Partial<ConvertFile>) => void;
  setTargetFormat: (id: string, format: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      files: [],
      settings: DEFAULT_SETTINGS,
      toasts: [],

      addFilePaths: async (paths: string[]) => {
        const { settings } = get();

        const newFiles: ConvertFile[] = [];
        for (const filePath of paths) {
          const name = filePath.split("/").pop() ?? filePath;
          const ext = name.split(".").pop()?.toLowerCase() ?? "";
          const category = detectCategory(name);
          if (!category) continue;

          let sizeBytes = 0;
          try {
            const info = await invoke<{ size_bytes: number }>("get_file_info", { path: filePath });
            sizeBytes = info.size_bytes;
          } catch {
            // size stays 0
          }

          const defaultFormatKey = `default${category.charAt(0).toUpperCase() + category.slice(1)}Format` as keyof AppSettings;
          const targetFormat = settings.useDefaultsAutomatically
            ? (settings[defaultFormatKey] as string)
            : getDefaultOutputFormat(category);

          newFiles.push({
            id: generateId(),
            filePath,
            name,
            sizeBytes,
            extension: ext,
            category,
            targetFormat,
            status: "idle" as const,
            progress: 0,
          });
        }

        set((state) => ({ files: [...state.files, ...newFiles] }));
      },

      removeFile: (id: string) => {
        set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
      },

      clearFiles: () => set({ files: [] }),

      updateFile: (id: string, patch: Partial<ConvertFile>) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, ...patch } : f,
          ),
        }));
      },

      setTargetFormat: (id: string, format: string) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, targetFormat: format } : f,
          ),
        }));
      },

      updateSettings: (patch: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...patch },
        }));
      },

      addToast: (message: string, type: Toast["type"]) => {
        const id = generateId();
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },

      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
    }),
    {
      name: "vert-desktop-store",
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
