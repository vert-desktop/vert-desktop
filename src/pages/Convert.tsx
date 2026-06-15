import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useRef, useCallback } from "react";
import { useAppStore } from "../store";
import ConversionPanel from "../components/ConversionPanel";
import FileCard from "../components/FileCard";

export default function Convert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const files = useAppStore((s) => s.files);
  const addFiles = useAppStore((s) => s.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      addFiles(Array.from(fileList));
    },
    [addFiles],
  );

  if (files.length === 0) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <ConversionPanel />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-3">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[rgb(var(--border))] py-4 text-sm text-[rgb(var(--muted))] transition-colors hover:border-brand-400 hover:text-brand-500"
            >
              <Plus size={16} />
              Add more files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
