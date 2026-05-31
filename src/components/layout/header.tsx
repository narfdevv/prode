"use client";

import { useQuery } from "@tanstack/react-query";
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

function formatCountdown(startsAt: string, now: number) {
  const diff = new Date(startsAt).getTime() - now;

  if (diff <= 0) return "Mundial iniciado";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  if (days > 0) return `${days}d ${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
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
  const countdownText = useMemo(
    () => (countdown?.startsAt ? formatCountdown(countdown.startsAt, now) : null),
    [countdown?.startsAt, now],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="h-14 md:h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <h1 className="text-primary font-bold tracking-wide text-sm md:text-lg leading-tight">
        <span className="sm:hidden">FIFA 2026 PRODE</span>
                {countdownText ? (
          <div
            className="hidden sm:flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10"
            title={countdown?.openingMatch}
          >
            <span className="text-[10px] md:text-xs font-bold uppercase text-slate-500">Faltan</span>
            <span className="text-xs md:text-sm font-bold text-primary">{countdownText}</span>
          </div>
        ) : null}
      </h1>
      <div className="flex items-center gap-2">

        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border">
          <span className="font-bold text-primary text-sm">
            {isLoading ? "..." : data?.rank ? `#${data.rank}` : "S/P"}
          </span>
          <div className="w-px h-3.5 bg-slate-300" />
          <span className="text-xs md:text-sm font-medium text-slate-700">
            {data?.totalUsers ?? 0} usuarios
          </span>
        </div>
      </div>
    </header>
  );
}
