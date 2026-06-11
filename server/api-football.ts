import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getKickoffTime } from "@/lib/match-time";

const WORLD_CUP_API_BASE_URL = process.env.WORLD_CUP_API_BASE_URL ?? "https://worldcup26.ir";
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

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

type WorldCupGame = {
  id: string | number;
  home_team_id: string | number | null;
  away_team_id: string | number | null;
  home_score: string | number | null;
  away_score: string | number | null;
  group: string | null;
  matchday: string | number | null;
  local_date: string | null;
  finished: boolean | string;
  type: string | null;
  home_team_name_en?: string | null;
  away_team_name_en?: string | null;
};

type WorldCupTeam = {
  id: string | number;
  name_en: string;
  fifa_code: string | null;
  iso2?: string | null;
  groups?: string | null;
};

type WorldCupGroup = {
  name: string;
  teams: Array<{
    team_id: string | number;
    mp: string | number;
    w: string | number;
    l: string | number;
    d: string | number;
    pts: string | number;
    gf: string | number;
    ga: string | number;
    gd: string | number;
  }>;
};

type SyncResult = {
  fetched: number;
  inserted: number;
  updated: number;
};

type ScoreSyncResult = SyncResult & {
  scoredPredictions: number;
};

async function worldCupGet<T>(path: string) {
  const url = new URL(path, WORLD_CUP_API_BASE_URL);
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`WorldCup26 request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.response)) return payload.response as T[];
  if (Array.isArray(payload?.games)) return payload.games as T[];
  if (Array.isArray(payload?.teams)) return payload.teams as T[];
  if (Array.isArray(payload?.groups)) return payload.groups as T[];

  if (payload?.message || payload?.error) {
    throw new Error(`WorldCup26 returned errors: ${payload.message ?? payload.error}`);
  }

  throw new Error("WorldCup26 returned an unexpected response shape");
}

function toIsoCountryCode(teamName: string, apiCode: string | null) {
  const byApiCode: Record<string, string> = {
    ARG: "AR",
    AUS: "AU",
    AUT: "AT",
    BEL: "BE",
    BRA: "BR",
    CAN: "CA",
    CHI: "CL",
    COL: "CO",
    CRO: "HR",
    DEN: "DK",
    ECU: "EC",
    ENG: "ENG",
    FRA: "FR",
    GER: "DE",
    GHA: "GH",
    IRN: "IR",
    ITA: "IT",
    JPN: "JP",
    KOR: "KR",
    MEX: "MX",
    MAR: "MA",
    NED: "NL",
    NOR: "NO",
    PAR: "PY",
    PER: "PE",
    POL: "PL",
    POR: "PT",
    QAT: "QA",
    KSA: "SA",
    SEN: "SN",
    SRB: "RS",
    ESP: "ES",
    SUI: "CH",
    TUN: "TN",
    URU: "UY",
    USA: "US",
    ALG: "DZ",
    BIH: "BA",
    CIV: "CI",
    COD: "CD",
    CPV: "CV",
    CZE: "CZ",
    CUW: "CW",
    HAI: "HT",
    IRQ: "IQ",
    NZL: "NZ",
    PAN: "PA",
    RSA: "ZA",
    SWE: "SE",
    TUR: "TR",
    UZB: "UZ",
  };
  const byName: Record<string, string> = {
    Algeria: "DZ",
    "Bosnia & Herzegovina": "BA",
    "Bosnia and Herzegovina": "BA",
    "Cape Verde": "CV",
    "Costa Rica": "CR",
    Curaçao: "CW",
    Curacao: "CW",
    "Czech Republic": "CZ",
    "Democratic Republic of the Congo": "CD",
    "Ivory Coast": "CI",
    Jordan: "JO",
    "New Zealand": "NZ",
    "Northern Ireland": "GB",
    "Saudi Arabia": "SA",
    SCO: "SCO",
    Scotland: "SCO",
    "South Africa": "ZA",
    "South Korea": "KR",
    Wales: "GB",
  };

  return (apiCode ? byApiCode[apiCode] : null) ?? byName[teamName] ?? apiCode ?? "";
}

function normalizeTeamIso(team: WorldCupTeam | null | undefined) {
  if (!team) return "";
  if (team.iso2 && team.iso2.length === 2) return team.iso2.toUpperCase();
  return toIsoCountryCode(team.name_en, team.fifa_code);
}

function translateTeamName(teamName: string) {
  const translations: Record<string, string> = {
    Algeria: "Argelia",
    Argentina: "Argentina",
    Australia: "Australia",
    Austria: "Austria",
    Belgium: "Bélgica",
    "Bosnia & Herzegovina": "Bosnia y Herzegovina",
    "Bosnia and Herzegovina": "Bosnia y Herzegovina",
    Brazil: "Brasil",
    Canada: "Canadá",
    "Cape Verde": "Cabo Verde",
    Colombia: "Colombia",
    Croatia: "Croacia",
    Curaçao: "Curazao",
    Curacao: "Curazao",
    "Czech Republic": "República Checa",
    "Democratic Republic of the Congo": "República Democrática del Congo",
    Ecuador: "Ecuador",
    Egypt: "Egipto",
    England: "Inglaterra",
    France: "Francia",
    Germany: "Alemania",
    Ghana: "Ghana",
    Haiti: "Haití",
    Iran: "Irán",
    Iraq: "Irak",
    "Ivory Coast": "Costa de Marfil",
    Japan: "Japón",
    Jordan: "Jordania",
    Mexico: "México",
    Morocco: "Marruecos",
    Netherlands: "Países Bajos",
    "New Zealand": "Nueva Zelanda",
    Norway: "Noruega",
    Panama: "Panamá",
    Paraguay: "Paraguay",
    Portugal: "Portugal",
    Qatar: "Qatar",
    "Saudi Arabia": "Arabia Saudita",
    Scotland: "Escocia",
    Senegal: "Senegal",
    "South Africa": "Sudáfrica",
    "South Korea": "Corea del Sur",
    Spain: "España",
    Sweden: "Suecia",
    Switzerland: "Suiza",
    Tunisia: "Túnez",
    Turkey: "Turquía",
    Uruguay: "Uruguay",
    Uzbekistan: "Uzbekistán",
    "United States": "Estados Unidos",
  };

  return translations[teamName] ?? teamName;
}

function parseNullableScore(value: string | number | null) {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isFinished(value: boolean | string) {
  if (typeof value === "boolean") return value;
  return value.toLowerCase() === "true";
}

function parseMatchDate(value: string | null) {
  if (!value) return new Date("2026-06-11T12:00:00.000Z").toISOString();
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date(`${value} 12:00:00 UTC`).toISOString();
}

function getStage(game: WorldCupGame) {
  if (game.group) return `Grupo ${game.group}`;
  if (game.type) return game.type;
  return game.matchday ? `Fecha ${game.matchday}` : "Mundial 2026";
}

function getStatus(game: WorldCupGame) {
  return isFinished(game.finished) ? "FT" : "NS";
}

function normalizeGame(game: WorldCupGame, teamsById: Map<string, WorldCupTeam>) {
  const homeTeam = game.home_team_id !== null ? teamsById.get(String(game.home_team_id)) : null;
  const awayTeam = game.away_team_id !== null ? teamsById.get(String(game.away_team_id)) : null;
  const finished = isFinished(game.finished);
  const homeTeamName = homeTeam?.name_en ?? game.home_team_name_en ?? "TBD";
  const awayTeamName = awayTeam?.name_en ?? game.away_team_name_en ?? "TBD";

  return {
    api_id: Number(game.id),
    kickoff_at: parseMatchDate(game.local_date),
    stage: getStage(game),
    home_team: translateTeamName(homeTeamName),
    home_team_code: toIsoCountryCode(homeTeamName, homeTeam?.fifa_code ?? null),
    away_team: translateTeamName(awayTeamName),
    away_team_code: toIsoCountryCode(awayTeamName, awayTeam?.fifa_code ?? null),
    home_score: finished ? parseNullableScore(game.home_score) : null,
    away_score: finished ? parseNullableScore(game.away_score) : null,
    status: getStatus(game),
    updated_at: new Date().toISOString(),
  };
}

function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
) {
  if (predictedHome === actualHome && predictedAway === actualAway) return 5;

  const predictedOutcome = Math.sign(predictedHome - predictedAway);
  const actualOutcome = Math.sign(actualHome - actualAway);
  return predictedOutcome === actualOutcome ? 2 : 0;
}

export async function fetchWorldCupFixtures() {
  const [games, teams] = await Promise.all([
    worldCupGet<WorldCupGame>("/get/games"),
    worldCupGet<WorldCupTeam>("/get/teams"),
  ]);
  const teamsById = new Map(teams.map((team) => [String(team.id), team]));
  return games.map((game) => normalizeGame(game, teamsById));
}

export async function getWorldCupGroups() {
  const [groups, teams] = await Promise.all([
    worldCupGet<WorldCupGroup>("/get/groups"),
    worldCupGet<WorldCupTeam>("/get/teams"),
  ]);
  const teamsById = new Map(teams.map((team) => [String(team.id), team]));

  return groups
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((group) => ({
      name: group.name,
      teams: group.teams
        .map((row) => {
          const team = teamsById.get(String(row.team_id));
          const teamName = team?.name_en ?? "TBD";

          return {
            teamId: String(row.team_id),
            name: translateTeamName(teamName),
            countryCode: normalizeTeamIso(team),
            played: Number(row.mp),
            won: Number(row.w),
            drawn: Number(row.d),
            lost: Number(row.l),
            goalsFor: Number(row.gf),
            goalsAgainst: Number(row.ga),
            goalDifference: Number(row.gd),
            points: Number(row.pts),
          };
        })
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
          return a.name.localeCompare(b.name);
        }),
    }));
}

export async function syncWorldCupFixtures(): Promise<SyncResult> {
  const fixtures = await fetchWorldCupFixtures();
  let inserted = 0;
  let updated = 0;

  for (const item of fixtures) {
    const { data: existing, error: findError } = await supabase
      .from("matches")
      .select("id")
      .eq("api_id", item.api_id)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      const { error } = await supabase.from("matches").update(item).eq("id", existing.id);
      if (error) throw error;
      updated += 1;
      continue;
    }

    const { error } = await supabase.from("matches").insert({
      ...item,
      id: item.api_id,
    });
    if (error) throw error;
    inserted += 1;
  }

  return {
    fetched: fixtures.length,
    inserted,
    updated,
  };
}

export async function syncWorldCupResults(): Promise<ScoreSyncResult> {
  const fixtures = await fetchWorldCupFixtures();
  let inserted = 0;
  let updated = 0;
  let scoredPredictions = 0;

  for (const item of fixtures) {
    if (!FINISHED_STATUSES.has(item.status) || item.home_score === null || item.away_score === null) {
      if (getKickoffTime(item.kickoff_at) < Date.now()) {
        const { data: match } = await supabase
          .from("matches")
          .select("id, status")
          .eq("api_id", item.api_id)
          .maybeSingle();

        if (match && !FINISHED_STATUSES.has(match.status)) {
          await supabase
            .from("matches")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", match.id);
        }
      }
      continue;
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id")
      .eq("api_id", item.api_id)
      .maybeSingle();

    if (matchError) throw matchError;

    if (!match) {
      const { error } = await supabase.from("matches").insert({
        ...item,
        id: item.api_id,
      });
      if (error) throw error;
      inserted += 1;
    } else {
      const { error } = await supabase
        .from("matches")
        .update({
          home_score: item.home_score,
          away_score: item.away_score,
          status: item.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", match.id);
      if (error) throw error;
      updated += 1;
    }

    const matchId = match?.id ?? item.api_id;
    const { data: predictions, error: predictionsError } = await supabase
      .from("predictions")
      .select("id, predicted_home_score, predicted_away_score")
      .eq("match_id", matchId);

    if (predictionsError) throw predictionsError;

    for (const prediction of predictions ?? []) {
      const points = calculatePoints(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
        item.home_score,
        item.away_score,
      );
      const { error } = await supabase
        .from("predictions")
        .update({
          points,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prediction.id);

      if (error) throw error;
      scoredPredictions += 1;
    }
  }

  return {
    fetched: fixtures.length,
    inserted,
    updated,
    scoredPredictions,
  };
}
