import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import clsx from "clsx";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { useAppStore } from "../store";

interface DragDropPayload {
  paths: string[];
  position: { x: number; y: number };
}

export default function Uploader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addFilePaths = useAppStore((s) => s.addFilePaths);
  const [isDragging, setIsDragging] = useState(false);

  const handlePaths = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) return;
      await addFilePaths(paths);
      navigate("/convert");
    },
    [addFilePaths, navigate],
  );

  // Listen to Tauri native drag-drop events (gives real filesystem paths)
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    listen<DragDropPayload>("tauri://drag-drop", (event) => {
      setIsDragging(false);
      if (event.payload.paths?.length) {
        handlePaths(event.payload.paths);
      }
    }).then((fn) => { unlisten = fn; });

    listen("tauri://drag-enter", () => setIsDragging(true)).then(() => {});
    listen("tauri://drag-leave", () => setIsDragging(false)).then(() => {});

    return () => { unlisten?.(); };
  }, [handlePaths]);

  const handleClick = async () => {
    const selected = await open({
      multiple: true,
      filters: [
        { name: "All supported", extensions: ["png","jpg","jpeg","webp","gif","bmp","tiff","avif","heic","jxl","svg","psd","exr","hdr","dng","nef","cr2","arw","mp3","wav","flac","ogg","opus","aac","m4a","wma","aiff","mp2","au","mp4","mkv","webm","avi","mov","wmv","ts","m4v","3gp","ogv","flv","docx","doc","md","html","rtf","epub","odt","rst","csv"] },
      ],
    });
    if (!selected) return;
    const paths = Array.isArray(selected) ? selected : [selected];
    await handlePaths(paths);
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all",
        isDragging
          ? "border-brand-500 bg-brand-500/5"
          : "border-[rgb(var(--border))] hover:border-brand-400 hover:bg-brand-500/5",
      )}
    >
      <div className={clsx("rounded-2xl p-4 transition-colors", isDragging ? "bg-brand-500/10" : "bg-[rgb(var(--border))]/30")}>
        <Upload size={32} className={clsx("transition-colors", isDragging ? "text-brand-500" : "text-[rgb(var(--muted))]")} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-[rgb(var(--fg))]">{t("home.dropFiles")}</p>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">{t("home.clickOrDrop")}</p>
      </div>
    </div>
  );
}
