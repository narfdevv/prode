import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type LoginUserInput = {
  email: string;
  password: string;
};

type LoginUserResult =
  | { ok: true }
  | { ok: false; message: string; status: number };

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

export async function loginUser(input: LoginUserInput): Promise<LoginUserResult> {
  const email = input.email.trim().toLowerCase();

  const { data: credentialsAreValid, error } = await supabase.rpc("validate_user_credentials", {
    p_email: email,
    p_password: input.password,
  });

  if (error) {
    return {
      ok: false,
      status: 500,
      message: "No pudimos validar tu email. Intentá nuevamente.",
    };
  }

  if (!credentialsAreValid) {
    return {
      ok: false,
      status: 404,
      message: "Email o contraseña incorrectos.",
    };
  }

  return { ok: true };
}
