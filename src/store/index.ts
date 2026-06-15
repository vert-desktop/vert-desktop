import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConvertFile, AppSettings } from "../converters/types";
import { detectCategory, getDefaultOutputFormat } from "../converters/formats";

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
  addFiles: (files: File[]) => void;
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

      addFiles: (rawFiles: File[]) => {
        const { settings } = get();
        const newFiles: ConvertFile[] = rawFiles
          .map((f) => {
            const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
            const category = detectCategory(f.name);
            if (!category) return null;

            const defaultFormatKey = `default${category.charAt(0).toUpperCase() + category.slice(1)}Format` as keyof AppSettings;
            const targetFormat = settings.useDefaultsAutomatically
              ? (settings[defaultFormatKey] as string)
              : getDefaultOutputFormat(category);

            return {
              id: generateId(),
              file: f,
              name: f.name,
              sizeBytes: f.size,
              extension: ext,
              category,
              targetFormat,
              status: "idle" as const,
              progress: 0,
            };
          })
          .filter(Boolean) as ConvertFile[];

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
