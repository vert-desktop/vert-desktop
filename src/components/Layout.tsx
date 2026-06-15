import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Toasts from "./Toasts";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <Navbar />
      <main className="flex-1 overflow-auto">{children}</main>
      <Toasts />
    </div>
  );
}
