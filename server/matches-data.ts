import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getPredictionDeadline } from "@/lib/match-time";

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

export async function getMatchesWithPredictions(email: string) {
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

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("kickoff_at")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) throw new Error("Match not found");
  if (Date.now() >= getPredictionDeadline(match.kickoff_at)) {
    throw new Error("Predictions are closed for this match");
  }

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
