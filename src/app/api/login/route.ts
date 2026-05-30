import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "../../../../server/login";

const loginSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Ingresá un email corporativo válido." },
      { status: 400 },
    );
  }

  const result = await loginUser(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
