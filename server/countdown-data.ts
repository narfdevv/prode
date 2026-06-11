import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getKickoffTime } from "@/lib/match-time";
import { fetchWorldCupFixtures } from "./api-football";

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

export async function getWorldCupCountdown() {
  const { data, error } = await supabase
    .from("matches")
    .select("kickoff_at, home_team, away_team")
    .order("kickoff_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return {
      startsAt: data.kickoff_at,
      openingMatch: `${data.home_team} vs ${data.away_team}`,
    };
  }

  const fixtures = await fetchWorldCupFixtures();
  const openingMatch = fixtures.sort(
    (a, b) => getKickoffTime(a.kickoff_at) - getKickoffTime(b.kickoff_at),
  )[0];

  if (!openingMatch) {
    return null;
  }

  return {
    startsAt: openingMatch.kickoff_at,
    openingMatch: `${openingMatch.home_team} vs ${openingMatch.away_team}`,
  };
}
