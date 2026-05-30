import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ClipboardList, History, BarChart2, BookOpen } from "lucide-react";

const mobileNavItems = [
  { href: "/forecast", icon: ClipboardList, label: "Pronósticos" },
  { href: "/history", icon: History, label: "Historial" },
  { href: "/leaderboard", icon: BarChart2, label: "Tabla" },
  { href: "/rules", icon: BookOpen, label: "Reglamento" },
];

function MobileBottomNav() {
  const [location] = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex md:hidden items-center justify-around z-50">
      {mobileNavItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex flex-col items-center gap-0.5 px-3 cursor-pointer transition-colors ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col md:ml-[220px]">
        <Header />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
