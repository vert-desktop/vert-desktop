import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "../store";
import ConversionPanel from "../components/ConversionPanel";
import FileCard from "../components/FileCard";

export default function Convert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const files = useAppStore((s) => s.files);
  const addFilePaths = useAppStore((s) => s.addFilePaths);

  const handleAddMore = async () => {
    const selected = await open({ multiple: true });
    if (!selected) return;
    const paths = Array.isArray(selected) ? selected : [selected];
    await addFilePaths(paths);
  };

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
              onClick={handleAddMore}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[rgb(var(--border))] py-4 text-sm text-[rgb(var(--muted))] transition-colors hover:border-brand-400 hover:text-brand-500"
            >
              <Plus size={16} />
              {t("convert.addFiles")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
