"use client";

import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { CountryFlag } from "@/components/country-flag";

type GroupStanding = {
  teamId: string;
  name: string;
  countryCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type Group = {
  name: string;
  teams: GroupStanding[];
};

async function fetchGroups(): Promise<Group[]> {
  const response = await fetch("/api/groups");
  if (!response.ok) throw new Error("Could not load groups");
  return response.json();
}

export default function Groups() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["worldcup-groups"],
    queryFn: fetchGroups,
  });

  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Posiciones de Grupos</h1>
        <p className="text-slate-500 mt-1 text-sm">Tabla oficial del Mundial 2026 por grupo.</p>
      </div>

      {!isLoading && groups.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-slate-500">
          Todavía no hay posiciones disponibles.
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {groups.map((group) => (
          <section key={group.name} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 md:px-5 py-3 bg-primary text-primary-foreground">
              <h2 className="font-bold text-sm md:text-base">Grupo {group.name}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase border-b">
                  <tr>
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-2 py-3 text-center">PJ</th>
                    <th className="px-2 py-3 text-center">G</th>
                    <th className="px-2 py-3 text-center">E</th>
                    <th className="px-2 py-3 text-center">P</th>
                    <th className="px-2 py-3 text-center">GF</th>
                    <th className="px-2 py-3 text-center">GC</th>
                    <th className="px-2 py-3 text-center">DG</th>
                    <th className="px-4 py-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-800">
                  {group.teams.map((team) => (
                    <tr key={team.teamId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold">
                        <div className="flex items-center gap-2">
                          <CountryFlag countryCode={team.countryCode} label={team.name} className="text-base" />
                          <span>{team.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center">{team.played}</td>
                      <td className="px-2 py-3 text-center">{team.won}</td>
                      <td className="px-2 py-3 text-center">{team.drawn}</td>
                      <td className="px-2 py-3 text-center">{team.lost}</td>
                      <td className="px-2 py-3 text-center">{team.goalsFor}</td>
                      <td className="px-2 py-3 text-center">{team.goalsAgainst}</td>
                      <td className="px-2 py-3 text-center">{team.goalDifference}</td>
                      <td className="px-4 py-3 text-right font-bold">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
