import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";
import { SUPPORTED_LANGUAGES } from "../i18n";
import type { AppSettings } from "../converters/types";
import { getOutputFormats } from "../converters/formats";

export default function Settings() {
  const { t } = useTranslation();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    updateSettings({ [key]: value });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold">{t("settings.title")}</h1>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold border-b border-[rgb(var(--border))] pb-2">
          {t("settings.appearance.title")}
        </h2>
        <div className="flex flex-col gap-4">
          <SettingRow label={t("settings.appearance.theme")}>
            <select
              value={settings.theme}
              onChange={(e) => update("theme", e.target.value as AppSettings["theme"])}
              className="select-field"
            >
              <option value="system">{t("settings.appearance.system")}</option>
              <option value="light">{t("settings.appearance.light")}</option>
              <option value="dark">{t("settings.appearance.dark")}</option>
            </select>
          </SettingRow>

          <SettingRow label={t("settings.appearance.language")}>
            <select
              value={settings.language}
              onChange={(e) => update("language", e.target.value)}
              className="select-field"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </SettingRow>
        </div>
      </section>

      {/* Conversion */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold border-b border-[rgb(var(--border))] pb-2">
          {t("settings.conversion.title")}
        </h2>
        <div className="flex flex-col gap-4">
          <SettingRow label={`${t("settings.conversion.image")} (${t("settings.conversion.defaultFormats")})`}>
            <FormatSelect
              category="image"
              value={settings.defaultImageFormat}
              onChange={(v) => update("defaultImageFormat", v)}
            />
          </SettingRow>

          <SettingRow label={`${t("settings.conversion.audio")} (${t("settings.conversion.defaultFormats")})`}>
            <FormatSelect
              category="audio"
              value={settings.defaultAudioFormat}
              onChange={(v) => update("defaultAudioFormat", v)}
            />
          </SettingRow>

          <SettingRow label={`${t("settings.conversion.video")} (${t("settings.conversion.defaultFormats")})`}>
            <FormatSelect
              category="video"
              value={settings.defaultVideoFormat}
              onChange={(v) => update("defaultVideoFormat", v)}
            />
          </SettingRow>

          <SettingRow label={`${t("settings.conversion.document")} (${t("settings.conversion.defaultFormats")})`}>
            <FormatSelect
              category="document"
              value={settings.defaultDocumentFormat}
              onChange={(v) => update("defaultDocumentFormat", v)}
            />
          </SettingRow>

          <SettingRow label={t("settings.conversion.quality")}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="100"
                value={settings.quality}
                onChange={(e) => update("quality", Number(e.target.value))}
                className="w-32"
              />
              <span className="w-10 text-sm tabular-nums">{settings.quality}%</span>
            </div>
          </SettingRow>

          <SettingRow label={t("settings.conversion.audioBitrate")}>
            <select
              value={settings.audioBitrate}
              onChange={(e) => update("audioBitrate", Number(e.target.value))}
              className="select-field"
            >
              {[64, 96, 128, 160, 192, 256, 320].map((b) => (
                <option key={b} value={b}>{b} kbps</option>
              ))}
            </select>
          </SettingRow>

          <SettingRow label={t("settings.conversion.preserveMetadata")}>
            <Toggle
              value={settings.preserveMetadata}
              onChange={(v) => update("preserveMetadata", v)}
            />
          </SettingRow>

          <SettingRow label={t("settings.conversion.useDefaults")}>
            <Toggle
              value={settings.useDefaultsAutomatically}
              onChange={(v) => update("useDefaultsAutomatically", v)}
            />
          </SettingRow>
        </div>
      </section>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium text-[rgb(var(--fg))]">{label}</label>
      {children}
    </div>
  );
}

function FormatSelect({
  category,
  value,
  onChange,
}: {
  category: Parameters<typeof getOutputFormats>[0];
  value: string;
  onChange: (v: string) => void;
}) {
  const formats = getOutputFormats(category);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="select-field">
      {formats.map((f) => (
        <option key={f.ext} value={f.ext}>{f.label}</option>
      ))}
    </select>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-brand-500" : "bg-[rgb(var(--border))]"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
