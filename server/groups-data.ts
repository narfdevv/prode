import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

type TeamStats = {
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

export async function getWorldCupGroups() {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("stage, home_team, home_team_code, away_team, away_team_code, home_score, away_score, status")
    .like("stage", "Grupo %")
    .order("kickoff_at", { ascending: true });

  if (error) throw error;
  if (!matches || matches.length === 0) return [];

  const groups = new Map<string, Map<string, TeamStats>>();

  for (const match of matches) {
    if (!groups.has(match.stage)) groups.set(match.stage, new Map());
    const group = groups.get(match.stage)!;

    const ensureTeam = (name: string, code: string | null): TeamStats => {
      if (!group.has(name)) {
        group.set(name, {
          teamId: code ?? name,
          name,
          countryCode: code ?? "",
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        });
      }
      return group.get(name)!;
    };

    const home = ensureTeam(match.home_team, match.home_team_code);
    const away = ensureTeam(match.away_team, match.away_team_code);

    if (!FINISHED_STATUSES.has(match.status) || match.home_score === null || match.away_score === null) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.home_score;
    home.goalsAgainst += match.away_score;
    away.goalsFor += match.away_score;
    away.goalsAgainst += match.home_score;
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (match.home_score > match.away_score) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (match.home_score < match.away_score) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      home.points += 1;
      away.drawn += 1;
      away.points += 1;
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, teamsMap]) => ({
      name,
      teams: Array.from(teamsMap.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
      }),
    }));
}
