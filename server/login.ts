import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type LoginUserInput = {
  email: string;
};

type LoginUserResult =
  | { ok: true; user: { id: number; email: string } }
  | { ok: false; message: string; status: number };

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

export async function loginUser(input: LoginUserInput): Promise<LoginUserResult> {
  const email = input.email.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      status: 500,
      message: "No pudimos validar tu email. Intentá nuevamente.",
    };
  }

  if (!user) {
    return {
      ok: false,
      status: 404,
      message: "No encontramos un usuario registrado con ese email.",
    };
  }

  return { ok: true, user };
}
