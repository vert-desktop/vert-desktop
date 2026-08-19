import { useTranslation } from "react-i18next";
import { Play, Download, Trash2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "../store";
import type { ConvertFile } from "../converters/types";

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e["message"] === "string") return e["message"];
    if (typeof e["kind"] === "string") return e["kind"];
    return JSON.stringify(err);
  }
  return String(err);
}

export default function ConversionPanel() {
  const { t } = useTranslation();
  const files = useAppStore((s) => s.files);
  const clearFiles = useAppStore((s) => s.clearFiles);
  const updateFile = useAppStore((s) => s.updateFile);
  const settings = useAppStore((s) => s.settings);
  const addToast = useAppStore((s) => s.addToast);

  const idleFiles = files.filter((f) => f.status === "idle");
  const doneFiles = files.filter((f) => f.status === "done");
  const convertingCount = files.filter((f) => f.status === "converting").length;

  const convertSingle = async (file: ConvertFile) => {
    updateFile(file.id, { status: "converting", progress: 10, error: undefined });

    try {
      const result = await invoke<{ output_path: string; size_bytes: number }>(
        "convert_file",
        {
          request: {
            input_path: file.filePath,
            output_format: file.targetFormat,
            options: {
              quality: settings.quality,
              audio_bitrate: settings.audioBitrate,
              sample_rate: settings.sampleRate,
              preserve_metadata: settings.preserveMetadata,
            },
          },
        },
      );

      updateFile(file.id, {
        status: "done",
        progress: 100,
        outputPath: result.output_path,
      });
    } catch (err) {
      const message = extractMessage(err);
      updateFile(file.id, { status: "error", progress: 0, error: message });
      addToast(t("errors.conversionFailed", { message }), "error");
    }
  };

  const handleConvertAll = async () => {
    await Promise.all(idleFiles.map(convertSingle));
  };

  const handleDownloadAll = () => {
    addToast("Download all: coming soon", "info");
  };

  return (
    <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] px-6 py-3">
      <div className="text-sm text-[rgb(var(--muted))]">
        {convertingCount > 0 ? (
          <span>{t("convert.converting")}</span>
        ) : (
          <span>
            {t("convert.progress", { current: doneFiles.length, total: files.length })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {doneFiles.length > 0 && (
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-sm font-medium hover:bg-[rgb(var(--border))]/30"
          >
            <Download size={15} />
            {t("convert.downloadAll")}
          </button>
        )}

        <button
          onClick={clearFiles}
          className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/30"
        >
          <Trash2 size={15} />
          {t("convert.removeAll")}
        </button>

        <button
          onClick={handleConvertAll}
          disabled={idleFiles.length === 0 || convertingCount > 0}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play size={15} />
          {t("convert.convertAll")}
        </button>
      </div>
    </div>
  );
}
