import { NextResponse } from "next/server";
import { getWorldCupCountdown } from "../../../../server/countdown-data";

export async function GET() {
  try {
    const countdown = await getWorldCupCountdown();
    return NextResponse.json(countdown);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No pudimos cargar el contador del Mundial.",
      },
      { status: 500 },
    );
  }
}
