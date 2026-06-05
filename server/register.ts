import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type RegisterUserInput = {
  email: string;
  firstName: string;
  lastName: string;
};

type RegisterUserResult =
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

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const email = input.email.trim().toLowerCase();

  const { data: wasRegistered, error } = await supabase.rpc("register_user_if_allowed", {
    p_email: email,
    p_first_name: input.firstName.trim(),
    p_last_name: input.lastName.trim(),
  });

  if (error) {
    return {
      ok: false,
      status: 500,
      message: "No pudimos completar el registro. Revisá los datos e intentá nuevamente.",
    };
  }

  if (!wasRegistered) {
    return {
      ok: false,
      status: 403,
      message: "No pudimos completar el registro con esos datos.",
    };
  }

  return { ok: true };
}
