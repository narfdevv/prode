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
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const email = input.email.trim().toLowerCase();
  const domain = getEmailDomain(email);
  const domainVariants = [domain, `@${domain}`];


  const { data: allowedDomain, error: domainError } = await supabase
    .from("allowed_domains")
    .select("id, domain, company_id, active")
    .in("domain", domainVariants)
    .eq("active", true)
    .maybeSingle();


  if (!allowedDomain) {
    const { data: visibleDomains, error: visibleDomainsError } = await supabase
      .from("allowed_domains")
      .select("id, domain, company_id, active")
      .limit(20);

  }

  if (domainError) {
    return {
      ok: false,
      status: 500,
      message: "No pudimos validar el dominio del email. Intentá nuevamente.",
    };
  }

  if (!allowedDomain) {
    return {
      ok: false,
      status: 403,
      message: "El dominio de tu email no está habilitado para registrarse.",
    };
  }

  const { error: insertError } = await supabase.from("users").insert({
    email,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    company_id: allowedDomain.company_id,
  });


  if (insertError) {
    return {
      ok: false,
      status: 500,
      message: "No pudimos completar el registro. Revisá los datos e intentá nuevamente.",
    };
  }

  return { ok: true };
}
