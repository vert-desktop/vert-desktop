import type { FileCategory, FormatInfo } from "./types";

export const IMAGE_FORMATS: FormatInfo[] = [
  { ext: "png", label: "PNG", canInput: true, canOutput: true },
  { ext: "jpg", label: "JPEG", canInput: true, canOutput: true },
  { ext: "webp", label: "WebP", canInput: true, canOutput: true },
  { ext: "gif", label: "GIF", canInput: true, canOutput: true },
  { ext: "bmp", label: "BMP", canInput: true, canOutput: true },
  { ext: "tiff", label: "TIFF", canInput: true, canOutput: true },
  { ext: "avif", label: "AVIF", canInput: true, canOutput: true },
  { ext: "heic", label: "HEIC", canInput: true, canOutput: true },
  { ext: "jxl", label: "JXL", canInput: true, canOutput: true },
  { ext: "ico", label: "ICO", canInput: true, canOutput: true },
  { ext: "svg", label: "SVG", canInput: true, canOutput: false },
  { ext: "psd", label: "PSD", canInput: true, canOutput: true },
  { ext: "exr", label: "EXR", canInput: true, canOutput: true },
  { ext: "hdr", label: "HDR", canInput: true, canOutput: true },
  { ext: "dng", label: "DNG", canInput: true, canOutput: false },
  { ext: "nef", label: "NEF", canInput: true, canOutput: false },
  { ext: "cr2", label: "CR2", canInput: true, canOutput: false },
  { ext: "arw", label: "ARW", canInput: true, canOutput: false },
];

export const AUDIO_FORMATS: FormatInfo[] = [
  { ext: "mp3", label: "MP3", canInput: true, canOutput: true },
  { ext: "wav", label: "WAV", canInput: true, canOutput: true },
  { ext: "flac", label: "FLAC", canInput: true, canOutput: true },
  { ext: "ogg", label: "OGG", canInput: true, canOutput: true },
  { ext: "opus", label: "Opus", canInput: true, canOutput: true },
  { ext: "aac", label: "AAC", canInput: true, canOutput: true },
  { ext: "m4a", label: "M4A", canInput: true, canOutput: true },
  { ext: "wma", label: "WMA", canInput: true, canOutput: true },
  { ext: "aiff", label: "AIFF", canInput: true, canOutput: true },
  { ext: "alac", label: "ALAC", canInput: true, canOutput: true },
  { ext: "mp2", label: "MP2", canInput: true, canOutput: true },
  { ext: "au", label: "AU", canInput: true, canOutput: true },
];

export const VIDEO_FORMATS: FormatInfo[] = [
  { ext: "mp4", label: "MP4", canInput: true, canOutput: true },
  { ext: "mkv", label: "MKV", canInput: true, canOutput: true },
  { ext: "webm", label: "WebM", canInput: true, canOutput: true },
  { ext: "avi", label: "AVI", canInput: true, canOutput: true },
  { ext: "mov", label: "MOV", canInput: true, canOutput: true },
  { ext: "wmv", label: "WMV", canInput: true, canOutput: true },
  { ext: "gif", label: "GIF", canInput: true, canOutput: true },
  { ext: "ts", label: "TS", canInput: true, canOutput: true },
  { ext: "m4v", label: "M4V", canInput: true, canOutput: true },
  { ext: "3gp", label: "3GP", canInput: true, canOutput: true },
  { ext: "ogv", label: "OGV", canInput: true, canOutput: true },
  { ext: "flv", label: "FLV", canInput: true, canOutput: false },
];

export const DOCUMENT_FORMATS: FormatInfo[] = [
  { ext: "docx", label: "DOCX", canInput: true, canOutput: true },
  { ext: "doc", label: "DOC", canInput: true, canOutput: true },
  { ext: "md", label: "Markdown", canInput: true, canOutput: true },
  { ext: "html", label: "HTML", canInput: true, canOutput: true },
  { ext: "rtf", label: "RTF", canInput: true, canOutput: true },
  { ext: "epub", label: "EPUB", canInput: true, canOutput: true },
  { ext: "odt", label: "ODT", canInput: true, canOutput: true },
  { ext: "rst", label: "RST", canInput: true, canOutput: true },
  { ext: "csv", label: "CSV", canInput: true, canOutput: true },
];

const ALL_INPUT_EXTENSIONS: Record<string, FileCategory> = {};

for (const f of IMAGE_FORMATS.filter((f) => f.canInput)) {
  ALL_INPUT_EXTENSIONS[f.ext] = "image";
}
for (const f of AUDIO_FORMATS.filter((f) => f.canInput)) {
  ALL_INPUT_EXTENSIONS[f.ext] = "audio";
}
for (const f of VIDEO_FORMATS.filter((f) => f.canInput)) {
  ALL_INPUT_EXTENSIONS[f.ext] = "video";
}
for (const f of DOCUMENT_FORMATS.filter((f) => f.canInput)) {
  ALL_INPUT_EXTENSIONS[f.ext] = "document";
}

export function detectCategory(filename: string): FileCategory | null {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ALL_INPUT_EXTENSIONS[ext] ?? null;
}

export function getOutputFormats(category: FileCategory): FormatInfo[] {
  const map: Record<FileCategory, FormatInfo[]> = {
    image: IMAGE_FORMATS,
    audio: AUDIO_FORMATS,
    video: VIDEO_FORMATS,
    document: DOCUMENT_FORMATS,
  };
  return map[category].filter((f) => f.canOutput);
}

export function getDefaultOutputFormat(category: FileCategory): string {
  const defaults: Record<FileCategory, string> = {
    image: "png",
    audio: "mp3",
    video: "mp4",
    document: "docx",
  };
  return defaults[category];
}
