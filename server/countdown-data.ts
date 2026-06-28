import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getKickoffTime } from "@/lib/match-time";

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

  if (!data) return null;

  return {
    startsAt: data.kickoff_at,
    openingMatch: `${data.home_team} vs ${data.away_team}`,
  };
}
