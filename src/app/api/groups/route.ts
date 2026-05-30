import { NextResponse } from "next/server";
import { getWorldCupGroups } from "../../../../server/api-football";

export async function GET() {
  try {
    const groups = await getWorldCupGroups();
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No pudimos cargar las posiciones de los grupos.",
      },
      { status: 500 },
    );
  }
}
