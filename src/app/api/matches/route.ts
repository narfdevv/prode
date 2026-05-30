import { NextResponse } from "next/server";
import { getMatchesWithPredictions } from "../../../../server/matches-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Falta el email del usuario." }, { status: 400 });
  }

  try {
    const matches = await getMatchesWithPredictions(email);
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json(
      { message: "No pudimos cargar los partidos." },
      { status: 500 },
    );
  }
}
