import { NextResponse } from "next/server";
import { getUserSummary } from "../../../../server/user-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Falta el email del usuario." }, { status: 400 });
  }

  try {
    const summary = await getUserSummary(email);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { message: "No pudimos cargar la información del usuario." },
      { status: 500 },
    );
  }
}
