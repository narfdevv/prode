"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock3, LogOutIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUserEmail } from "@/lib/current-user";

type UserSummary = {
  rank: number | null;
  totalUsers: number;
  points: number;
};

type CountdownData = {
  startsAt: string;
  openingMatch: string;
} | null;

async function fetchUserSummary(): Promise<UserSummary> {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Missing user email");

  const response = await fetch(`/api/me?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error("Could not load user summary");
  return response.json();
}

async function fetchCountdown(): Promise<CountdownData> {
  const response = await fetch("/api/countdown");
  if (!response.ok) throw new Error("Could not load countdown");
  return response.json();
}

function getCountdownParts(startsAt: string, now: number) {
  const diff = new Date(startsAt).getTime() - now;

  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { label: "Dias", value: String(days) },
    { label: "Horas", value: String(hours).padStart(2, "0") },
    { label: "Min", value: String(minutes).padStart(2, "0") },
    { label: "Seg", value: String(seconds).padStart(2, "0") },
  ];
}

export function Header() {
  const [now, setNow] = useState(() => Date.now());
  const { data, isLoading } = useQuery({
    queryKey: ["user-summary"],
    queryFn: fetchUserSummary,
    enabled: typeof window !== "undefined" && Boolean(getCurrentUserEmail()),
  });
  const { data: countdown } = useQuery({
    queryKey: ["worldcup-countdown"],
    queryFn: fetchCountdown,
  });
  const countdownParts = useMemo(
    () => (countdown?.startsAt ? getCountdownParts(countdown.startsAt, now) : null),
    [countdown?.startsAt, now],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    window.location.replace("/");
  }

  return (
    <header className="h-16 md:h-[76px] bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 md:px-8 sticky top-0 z-40">
      <div className="min-w-0 flex-1">
        {countdownParts ? (
          <div
            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm md:gap-3 md:px-3 md:py-2"
            title={countdown?.openingMatch}
          >
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:flex">
              <Clock3 className="h-5 w-5" />
            </div>

            <div className="grid grid-cols-4 gap-1.5 md:gap-2">
              {countdownParts.map((part) => (
                <div
                  key={part.label}
                  className="flex h-10 min-w-9 flex-col items-center justify-center rounded-md border border-slate-200 bg-white px-1 shadow-xs sm:h-11 sm:min-w-11 sm:px-1.5 md:h-12 md:min-w-14 md:px-2"
                >
                  <span className="font-mono text-sm font-extrabold leading-none text-slate-900 sm:text-base md:text-xl">
                    {part.value}
                  </span>
                  <span className="mt-1 text-[8px] font-bold uppercase leading-none text-slate-500 sm:text-[9px] md:text-[10px]">
                    {part.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <h1 className="text-sm font-bold leading-tight tracking-wide text-primary md:text-lg">
            FIFA 2026 PRODE
          </h1>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border bg-slate-100 px-3 py-1.5">
          <span className="font-bold text-primary text-sm">
            {isLoading ? "..." : data?.rank ? `#${data.rank}` : "S/P"}
          </span>
          <div className="hidden h-3.5 w-px bg-slate-300 sm:block" />
          <span className="hidden text-xs font-medium text-slate-700 sm:inline md:text-sm">
            {data?.totalUsers ?? 0} usuarios
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-primary md:hidden"
          aria-label="Cerrar sesión"
          data-testid="btn-logout-mobile"
        >
          <LogOutIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
