export type FileCategory = "image" | "audio" | "video" | "document";

export type ConversionStatus =
  | "idle"
  | "converting"
  | "done"
  | "error"
  | "cancelled";

export interface FormatInfo {
  ext: string;
  label: string;
  canInput: boolean;
  canOutput: boolean;
}

export interface ConvertFile {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  extension: string;
  category: FileCategory;
  targetFormat: string;
  status: ConversionStatus;
  progress: number;
  outputPath?: string;
  error?: string;
}

export interface ConvertOptions {
  quality?: number;
  audioBitrate?: number;
  sampleRate?: number;
  preserveMetadata?: boolean;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  defaultImageFormat: string;
  defaultAudioFormat: string;
  defaultVideoFormat: string;
  defaultDocumentFormat: string;
  quality: number;
  audioBitrate: number;
  sampleRate: number;
  preserveMetadata: boolean;
  useDefaultsAutomatically: boolean;
}
