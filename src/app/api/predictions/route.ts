import { NextResponse } from "next/server";
import { z } from "zod";
import { savePrediction } from "../../../../server/matches-data";

const predictionSchema = z.object({
  email: z.string().email(),
  matchId: z.number().int().positive(),
  predictedHomeScore: z.number().int().min(0).max(99),
  predictedAwayScore: z.number().int().min(0).max(99),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = predictionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "El pronóstico no es válido." }, { status: 400 });
  }

  try {
    await savePrediction(
      parsed.data.email,
      parsed.data.matchId,
      parsed.data.predictedHomeScore,
      parsed.data.predictedAwayScore,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "No pudimos guardar el pronóstico." },
      { status: 500 },
    );
  }
}
