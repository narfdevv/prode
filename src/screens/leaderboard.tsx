import { Trophy } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { leaderboardData } from "@/data/leaderboard";

const getTrophy = (rank: number) => {
  if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Trophy className="w-4 h-4 text-slate-400" />;
  if (rank === 3) return <Trophy className="w-4 h-4 text-amber-700" />;
  return null;
};

export default function Leaderboard() {
  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tabla de Posiciones</h1>
          <p className="text-slate-500 mt-1 text-sm">Clasificación en tiempo real de todos los participantes.</p>
        </div>
        <div className="bg-primary text-primary-foreground p-4 rounded-xl flex items-center gap-5 shadow-sm w-full sm:w-auto">
          <div className="flex flex-col px-10">
            <span className="text-[10px] text-primary-foreground/70 uppercase font-bold tracking-wide">Tu Posición</span>
            <span className="text-2xl md:text-3xl font-bold">#42</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[360px]">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 w-20">Pos.</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Participante</th>
                <th className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">Partidos</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-800">
              {leaderboardData.map((row) => (
                <tr
                  key={row.id}
                  className={row.isCurrentUser ? "bg-amber-50" : "hover:bg-slate-50 transition-colors"}
                  data-testid={`row-leaderboard-${row.id}`}
                >
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-1.5 font-bold text-sm md:text-base">
                      {getTrophy(row.rank)}
                      {row.rank}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-sm">
                    <span>{row.name}</span>
                    {row.isCurrentUser && (
                      <span className="ml-2 px-1.5 py-0.5 bg-secondary/30 text-yellow-800 text-[10px] rounded-full font-semibold">
                        TÚ
                      </span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500 text-sm hidden sm:table-cell">{row.matches}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-right text-sm">{row.points.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 md:p-4 border-t flex justify-center items-center gap-1.5 text-sm text-slate-600">
          <button className="px-3 py-1 hover:bg-slate-100 rounded text-xs md:text-sm" data-testid="btn-pagination-prev">Anterior</button>
          <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-primary text-white rounded font-bold text-xs" data-testid="btn-pagination-1">1</button>
          <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-slate-100 rounded text-xs" data-testid="btn-pagination-2">2</button>
          <button className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-slate-100 rounded text-xs" data-testid="btn-pagination-3">3</button>
          <button className="px-3 py-1 hover:bg-slate-100 rounded text-xs md:text-sm" data-testid="btn-pagination-next">Siguiente</button>
        </div>
      </div>
    </AppLayout>
  );
}
