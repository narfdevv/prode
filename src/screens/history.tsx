import { Download, ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/country-flag";

const historyData = [
  {
    id: 1,
    date: "14 de junio, 2026",
    stage: "Grupo A • Partido inaugural",
    homeTeam: "USA",
    homeCountryCode: "US",
    awayTeam: "MEX",
    awayCountryCode: "MX",
    prediction: "2 - 1",
    result: "2 - 1",
    points: "+5 pts",
    status: "EXACTO",
    statusColor: "bg-accent/10 text-accent border-accent/20",
  },
  {
    id: 2,
    date: "15 de junio, 2026",
    stage: "Grupo B • Partido 3",
    homeTeam: "BRA",
    homeCountryCode: "BR",
    awayTeam: "ALE",
    awayCountryCode: "DE",
    prediction: "3 - 1",
    result: "2 - 0",
    points: "+1 pt",
    status: "GANADOR",
    statusColor: "bg-secondary/20 text-yellow-800 border-secondary/30",
  },
  {
    id: 3,
    date: "16 de junio, 2026",
    stage: "Grupo C • Partido 5",
    homeTeam: "ING",
    homeCountryCode: "GB",
    awayTeam: "FRA",
    awayCountryCode: "FR",
    prediction: "0 - 2",
    result: "1 - 1",
    points: "+0 pts",
    status: "SIN PUNTOS",
    statusColor: "bg-slate-100 text-slate-500 border-slate-200",
  },
];

export default function History() {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-primary p-5 md:p-6 rounded-xl shadow-sm text-primary-foreground">
          <h3 className="text-xs font-bold opacity-70 uppercase mb-2 tracking-wide">Puntos Totales</h3>
          <div className="text-3xl md:text-4xl font-bold mb-1">142 pts</div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl border shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Precisión</h3>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">68%</div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent w-[68%]" />
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-xl border shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Marcadores Exactos</h3>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">12</div>
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
              {historyData.map((row) => (
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
            </tbody>
          </table>
        </div>
        <div className="p-3 md:p-4 border-t flex justify-center items-center gap-1.5 text-sm text-slate-600">
          <button className="px-3 py-1 hover:bg-slate-100 rounded text-xs">Anterior</button>
          <button className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded font-bold text-xs">1</button>
          <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded text-xs">2</button>
          <button className="px-3 py-1 hover:bg-slate-100 rounded text-xs">Siguiente</button>
        </div>
      </div>
    </AppLayout>
  );
}
