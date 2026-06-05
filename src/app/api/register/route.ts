import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "../../../../server/register";

const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Los datos del registro no son válidos." },
      { status: 400 },
    );
  }

  const result = await registerUser(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
