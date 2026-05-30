import { NextResponse } from "next/server";
import { getHistory } from "../../../../server/user-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Falta el email del usuario." }, { status: 400 });
  }

  try {
    const rows = await getHistory(email);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { message: "No pudimos cargar el historial." },
      { status: 500 },
    );
  }
}
