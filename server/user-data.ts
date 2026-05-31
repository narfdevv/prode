import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { checkAndSyncMatches } from "./matches-data";

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

export type LeaderboardEntry = {
  id: number;
  rank: number;
  name: string;
  matches: number;
  exactScores: number;
  winnerPredictions: number;
  points: number;
  isCurrentUser: boolean;
};

export type UserSummary = {
  rank: number | null;
  totalUsers: number;
  points: number;
  exactScores: number;
  playedPredictions: number;
  scoredPredictions: number;
};

export async function getCurrentUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("users")
    .select("id, email, first_name, last_name")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getLeaderboardRows() {
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("id, first_name, last_name, email, total_points")
    .order("total_points", { ascending: false, nullsFirst: false })
    .order("last_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getLeaderboard(email: string): Promise<LeaderboardEntry[]> {
  await checkAndSyncMatches();
  const [currentUser, rows] = await Promise.all([getCurrentUser(email), getLeaderboardRows()]);
  const userIds = rows.map((row) => row.id).filter((id): id is number => id !== null);

  const { data: predictionCounts, error: countsError } = await supabase
    .from("predictions")
    .select("user_id, points")
    .in("user_id", userIds);

  if (countsError) throw countsError;

  const matchesByUser = new Map<number, number>();
  const exactScoresByUser = new Map<number, number>();
  const winnerPredictionsByUser = new Map<number, number>();
  for (const prediction of predictionCounts ?? []) {
    matchesByUser.set(prediction.user_id, (matchesByUser.get(prediction.user_id) ?? 0) + 1);

    if (prediction.points === 5) {
      exactScoresByUser.set(prediction.user_id, (exactScoresByUser.get(prediction.user_id) ?? 0) + 1);
    }

    if (prediction.points === 2) {
      winnerPredictionsByUser.set(
        prediction.user_id,
        (winnerPredictionsByUser.get(prediction.user_id) ?? 0) + 1,
      );
    }
  }

  return rows.map((row, index) => {
    const id = row.id ?? 0;
    return {
      id,
      rank: index + 1,
      name: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || row.email || "Participante",
      matches: matchesByUser.get(id) ?? 0,
      exactScores: exactScoresByUser.get(id) ?? 0,
      winnerPredictions: winnerPredictionsByUser.get(id) ?? 0,
      points: row.total_points ?? 0,
      isCurrentUser: currentUser?.id === id,
    };
  });
}

export async function getUserSummary(email: string): Promise<UserSummary> {
  const [currentUser, leaderboard] = await Promise.all([getCurrentUser(email), getLeaderboard(email)]);
  const { count, error: countError } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;

  const currentRow = leaderboard.find((row) => row.isCurrentUser);
  const history = currentUser ? await getHistory(email) : [];
  const playedPredictions = history.filter((row) => row.result !== "-").length;
  const exactScores = history.filter((row) => row.status === "EXACTO").length;
  const scoredPredictions = history.filter((row) => row.pointsValue > 0).length;

  return {
    rank: currentRow?.rank ?? null,
    totalUsers: count ?? 0,
    points: currentRow?.points ?? 0,
    exactScores,
    playedPredictions,
    scoredPredictions,
  };
}

function getPredictionStatus(points: number) {
  if (points >= 5) {
    return {
      label: "EXACTO",
      color: "b-accent/10 text-accent border-accent/20",
    };
  }

  if (points > 0) {
    return {
      label: "GANADOR",
      color: "bg-secondary/20 text-yellow-800 border-secondary/30",
    };
  }

  return {
    label: "SIN PUNTOS",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  };
}

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export async function getHistory(email: string) {
  const currentUser = await getCurrentUser(email);
  if (!currentUser) return [];

  const { data, error } = await supabase
    .from("predictions")
    .select(`
      id,
      points,
      predicted_home_score,
      predicted_away_score,
      matches (
        id,
        kickoff_at,
        stage,
        home_team,
        home_team_code,
        away_team,
        away_team_code,
        home_score,
        away_score
      )
    `)
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((prediction) => {
    const match = Array.isArray(prediction.matches) ? prediction.matches[0] : prediction.matches;
    const status = getPredictionStatus(prediction.points);
    const hasResult = match?.home_score !== null && match?.away_score !== null;

    return {
      id: prediction.id,
      date: match ? formatMatchDate(match.kickoff_at) : "-",
      stage: match?.stage ?? "-",
      homeTeam: match?.home_team ?? "-",
      homeCountryCode: match?.home_team_code ?? "",
      awayTeam: match?.away_team ?? "-",
      awayCountryCode: match?.away_team_code ?? "",
      prediction: `${prediction.predicted_home_score} - ${prediction.predicted_away_score}`,
      result: hasResult ? `${match?.home_score} - ${match?.away_score}` : "-",
      points: `+${prediction.points} ${prediction.points === 1 ? "pt" : "pts"}`,
      pointsValue: prediction.points,
      status: status.label,
      statusColor: status.color,
    };
  });
}
