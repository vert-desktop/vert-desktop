import { useTranslation } from "react-i18next";
import { Image, Music, Video, FileText } from "lucide-react";
import Uploader from "../components/Uploader";
import {
  IMAGE_FORMATS,
  AUDIO_FORMATS,
  VIDEO_FORMATS,
  DOCUMENT_FORMATS,
} from "../converters/formats";

const CATEGORIES = [
  {
    key: "image" as const,
    Icon: Image,
    formats: IMAGE_FORMATS,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    key: "audio" as const,
    Icon: Music,
    formats: AUDIO_FORMATS,
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    key: "video" as const,
    Icon: Video,
    formats: VIDEO_FORMATS,
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    key: "document" as const,
    Icon: FileText,
    formats: DOCUMENT_FORMATS,
    color: "text-green-500 bg-green-500/10",
  },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[rgb(var(--fg))]">
          {t("home.tagline")}
        </h1>
        <p className="mt-3 text-lg text-[rgb(var(--muted))]">
          {t("home.subtitle")}
        </p>
      </div>

      <Uploader />

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map(({ key, Icon, formats, color }) => (
          <div
            key={key}
            className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-[rgb(var(--fg))]">
              {t(`home.categories.${key}`)}
            </h3>
            <p className="mt-1 text-xs text-[rgb(var(--muted))]">
              {t("home.formats", { count: formats.length })}
            </p>
            <p className="mt-2 text-xs text-[rgb(var(--muted))] leading-relaxed">
              {formats
                .slice(0, 6)
                .map((f) => f.label)
                .join(", ")}
              {formats.length > 6 && "…"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
