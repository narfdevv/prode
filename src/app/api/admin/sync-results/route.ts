import { NextResponse } from "next/server";
import { syncWorldCupResults } from "../../../../../server/api-football";
import { validateSyncSecret } from "../../../../../server/sync-auth";

export async function POST(request: Request) {
  if (!validateSyncSecret(request)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  try {
    const result = await syncWorldCupResults();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No pudimos sincronizar los resultados." },
      { status: 500 },
    );
  }
}
