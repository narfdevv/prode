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

export async function scoreAllPredictions() {
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, home_score, away_score, status")
    .not("home_score", "is", null)
    .not("away_score", "is", null);

  if (matchesError) throw matchesError;

  const finishedMatches = (matches ?? []).filter((m) => FINISHED_STATUSES.has(m.status));
  if (finishedMatches.length === 0) return { updated: 0 };

  const matchIds = finishedMatches.map((m) => m.id);
  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("id, match_id, predicted_home_score, predicted_away_score")
    .in("match_id", matchIds);

  if (predictionsError) throw predictionsError;

  const matchById = new Map(finishedMatches.map((m) => [m.id, m]));
  let updated = 0;

  for (const prediction of predictions ?? []) {
    const match = matchById.get(prediction.match_id);
    if (!match || match.home_score === null || match.away_score === null) continue;

    const points = calculatePoints(
      prediction.predicted_home_score,
      prediction.predicted_away_score,
      match.home_score,
      match.away_score,
    );

    const { error } = await supabase
      .from("predictions")
      .update({ points, updated_at: new Date().toISOString() })
      .eq("id", prediction.id);

    if (error) throw error;
    updated += 1;
  }

  return { updated };
}
