import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "../store";

export default function Uploader() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addFiles = useAppStore((s) => s.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (arr.length === 0) return;
      addFiles(arr);
      navigate("/convert");
    },
    [addFiles, navigate],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onClick = () => inputRef.current?.click();

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={clsx(
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all",
        isDragging
          ? "border-brand-500 bg-brand-500/5"
          : "border-[rgb(var(--border))] hover:border-brand-400 hover:bg-brand-500/5",
      )}
    >
      <div
        className={clsx(
          "rounded-2xl p-4 transition-colors",
          isDragging ? "bg-brand-500/10" : "bg-[rgb(var(--border))]/30",
        )}
      >
        <Upload
          size={32}
          className={clsx(
            "transition-colors",
            isDragging ? "text-brand-500" : "text-[rgb(var(--muted))]",
          )}
        />
      </div>
      <div className="text-center">
        <p className="font-semibold text-[rgb(var(--fg))]">
          {t("home.dropFiles")}
        </p>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          {t("home.clickOrDrop")}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
