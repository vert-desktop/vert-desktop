import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, ArrowRightLeft, Settings } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const { t } = useTranslation();

  const links = [
    { to: "/", label: t("nav.home"), Icon: Home },
    { to: "/convert", label: t("nav.convert"), Icon: ArrowRightLeft },
    { to: "/settings", label: t("nav.settings"), Icon: Settings },
  ];

  return (
    <nav className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--card))] px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-brand-500">
          VERT
        </span>
        <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-400">
          Desktop
        </span>
      </div>

      <div className="flex items-center gap-1">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                  : "text-[rgb(var(--muted))] hover:bg-[rgb(var(--border))]/50 hover:text-[rgb(var(--fg))]",
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
