import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { syncWorldCupResults } from "./api-football";

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

export async function checkAndSyncMatches() {
  const now = new Date();

  // Obtener partidos que no están finalizados en nuestra base de datos
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, kickoff_at, status, updated_at")
    .not("status", "in", '("FT","AET","PEN")');

  if (error || !matches || matches.length === 0) return;

  // Evaluar si alguno empezó hace más de 105 minutos y fue actualizado hace más de 3 minutos
  const needsSync = matches.some((match) => {
    const kickoff = new Date(match.kickoff_at);
    const minutesSinceKickoff = (now.getTime() - kickoff.getTime()) / (1000 * 60);

    if (minutesSinceKickoff > 105) {
      const updatedAt = new Date(match.updated_at || match.kickoff_at);
      const minutesSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60);
      return minutesSinceUpdate > 3; // Límite de 3 minutos de throttling
    }
    return false;
  });

  if (needsSync) {
    try {
      console.log("Lazy sync triggered for active/finished matches...");
      await syncWorldCupResults();
    } catch (err) {
      console.error("Error doing lazy sync:", err);
    }
  }
}

export async function getMatchesWithPredictions(email: string) {
  await checkAndSyncMatches();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (userError) throw userError;
  if (!user) return [];

  const [{ data: matches, error: matchesError }, { data: predictions, error: predictionsError }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("id, kickoff_at, stage, home_team, home_team_code, away_team, away_team_code, status")
        .order("kickoff_at", { ascending: true }),
      supabase
        .from("predictions")
        .select("match_id, predicted_home_score, predicted_away_score")
        .eq("user_id", user.id),
    ]);

  if (matchesError) throw matchesError;
  if (predictionsError) throw predictionsError;

  const predictionsByMatch = new Map(predictions?.map((prediction) => [prediction.match_id, prediction]));

  return (matches ?? []).map((match) => {
    const prediction = predictionsByMatch.get(match.id);

    return {
      id: match.id,
      stage: match.stage,
      kickoffAt: match.kickoff_at,
      homeTeam: match.home_team,
      homeCountryCode: match.home_team_code ?? "",
      awayTeam: match.away_team,
      awayCountryCode: match.away_team_code ?? "",
      status: match.status,
      prediction: prediction
        ? {
            home: prediction.predicted_home_score,
            away: prediction.predicted_away_score,
          }
        : null,
    };
  });
}

export async function savePrediction(
  email: string,
  matchId: number,
  predictedHomeScore: number,
  predictedAwayScore: number,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  const { data: existing, error: findError } = await supabase
    .from("predictions")
    .select("id")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    const { error } = await supabase
      .from("predictions")
      .update({
        predicted_home_score: predictedHomeScore,
        predicted_away_score: predictedAwayScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("predictions").insert({
    user_id: user.id,
    match_id: matchId,
    predicted_home_score: predictedHomeScore,
    predicted_away_score: predictedAwayScore,
  });

  if (error) throw error;
}
