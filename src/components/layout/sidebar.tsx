"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, History, BarChart2, BookOpen, LogOutIcon, Table2 } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/forecast", icon: ClipboardList, label: "Pronósticos" },
    { href: "/history", icon: History, label: "Historial" },
    { href: "/leaderboard", icon: BarChart2, label: "Tabla" },
    { href: "/groups", icon: Table2, label: "Grupos" },
    { href: "/rules", icon: BookOpen, label: "Reglamento" },
  ];

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    window.location.replace("/");
  }

  return (
    <div className="fixed left-0 top-0 h-full w-[220px] bg-white border-r border-slate-200 flex flex-col">
      <div className="px-6 pt-6 pb-5">
        <h2 className="text-primary text-base font-bold leading-tight">Prode 2026</h2>
        <p className="text-slate-400 text-xs mt-0.5 uppercase tracking-wide font-medium">Torneo Global</p>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                  isActive
                    ? "bg-secondary font-semibold text-primary"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                data-testid={`nav-link-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2"
          data-testid="btn-logout-sidebar"
        >
          <LogOutIcon className="w-4 h-4 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
