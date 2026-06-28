import { NextResponse } from "next/server";
import { scoreAllPredictions } from "../../../../../server/scoring-data";
import { validateSyncSecret } from "../../../../../server/sync-auth";

export async function POST(request: Request) {
  if (!validateSyncSecret(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const result = await scoreAllPredictions();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No pudimos calcular los puntos." },
      { status: 500 },
    );
  }
}
