"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { CountryFlag } from "@/components/country-flag";
import { getCurrentUserEmail } from "@/lib/current-user";

type HistoryRow = {
  id: number;
  date: string;
  stage: string;
  homeTeam: string;
  homeCountryCode: string;
  awayTeam: string;
  awayCountryCode: string;
  prediction: string;
  result: string;
  points: string;
  pointsValue: number;
  status: string;
  statusColor: string;
};

type UserSummary = {
  points: number;
  exactScores: number;
  playedPredictions: number;
  scoredPredictions: number;
};

const PAGE_SIZE = 8;

async function fetchHistory(): Promise<HistoryRow[]> {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Missing user email");

  const response = await fetch(`/api/history?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error("Could not load history");
  return response.json();
}

async function fetchUserSummary(): Promise<UserSummary> {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Missing user email");

  const response = await fetch(`/api/me?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error("Could not load user summary");
  return response.json();
}

export default function History() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: historyData = [], isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
    enabled: typeof window !== "undefined" && Boolean(getCurrentUserEmail()),
  });
  const { data: summary } = useQuery({
    queryKey: ["user-summary"],
    queryFn: fetchUserSummary,
    enabled: typeof window !== "undefined" && Boolean(getCurrentUserEmail()),
  });
  const accuracy =
    summary && summary.playedPredictions > 0
      ? Math.round((summary.scoredPredictions / summary.playedPredictions) * 100)
      : 0;
  const totalPages = Math.ceil(historyData.length / PAGE_SIZE);
  const visibleRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return historyData.slice(start, start + PAGE_SIZE);
  }, [currentPage, historyData]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-primary p-5 md:p-6 rounded-xl shadow-sm text-primary-foreground">
          <h3 className="text-xs font-bold opacity-70 uppercase mb-2 tracking-wide">Puntos Totales</h3>
          <div className="text-3xl md:text-4xl font-bold mb-1">{summary?.points ?? 0} pts</div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl border shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Precisión</h3>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{accuracy}%</div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${accuracy}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl border shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Marcadores Exactos</h3>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{summary?.exactScores ?? 0}</div>
          <p className="text-xs md:text-sm text-slate-500">Partidos con resultado perfecto</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[500px]">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">Fecha / Etapa</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Partido</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Tu Pronóstico</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Resultado</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-800">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="font-bold text-xs md:text-sm">{row.date}</div>
                    <div className="text-slate-500 text-[11px] md:text-xs mt-0.5">{row.stage}</div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-sm md:text-base">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <CountryFlag countryCode={row.homeCountryCode} label={row.homeTeam} className="text-base" />
                      <span>{row.homeTeam}</span>
                      <span className="text-slate-400 px-1">vs</span>
                      <span>{row.awayTeam}</span>
                      <CountryFlag countryCode={row.awayCountryCode} label={row.awayTeam} className="text-base" />
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center font-mono font-bold text-sm bg-slate-50">{row.prediction}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center font-mono font-bold text-sm bg-slate-100/50">{row.result}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-xs md:text-sm">{row.points}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && historyData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-8 text-center text-slate-500">
                    Todavía no tenés pronósticos cargados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="p-3 md:p-4 border-t flex justify-center items-center gap-1.5 text-sm text-slate-600">
            <button
              className="px-3 py-1 hover:bg-slate-100 rounded text-xs disabled:opacity-40 disabled:hover:bg-transparent"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                className={`w-7 h-7 flex items-center justify-center rounded font-bold text-xs ${
                  currentPage === page ? "bg-primary text-white" : "hover:bg-slate-100"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="px-3 py-1 hover:bg-slate-100 rounded text-xs disabled:opacity-40 disabled:hover:bg-transparent"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
