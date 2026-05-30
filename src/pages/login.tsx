import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trophy, Mail, ArrowRight } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Ingresá un email corporativo válido"),
});

export default function Login() {
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      setLocation("/forecast");
    }
  }, [setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(_values: z.infer<typeof loginSchema>) {
    localStorage.setItem("isLoggedIn", "true");
    setLocation("/forecast");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F7] to-[#E2E8F0] flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-primary font-bold text-2xl tracking-wide">
          FIFA 2026 CORPORATE PRODE
        </h1>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-lg border p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Bienvenido al Prode Corporativo</h2>
          <p className="text-slate-500 text-sm">Ingresá con tu email de la empresa para participar</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-600">EMAIL CORPORATIVO</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        placeholder="usuario@empresa.com"
                        className="pl-10 py-6"
                        data-testid="input-email"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full py-6 text-base" data-testid="btn-login">
              Entrar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </Form>

        <div className="mt-8 pt-6 border-t flex justify-center gap-6 text-sm">
          <a href="#" className="text-primary hover:underline font-medium">Dudas o Soporte</a>
          <span className="text-slate-300">|</span>
          <a href="#" className="text-primary hover:underline font-medium">Ayuda</a>
        </div>
      </div>

      <p className="mt-8 text-xs font-bold tracking-wider text-slate-400">
        PLATAFORMA CORPORATIVA OFICIAL
      </p>

      <div className="fixed bottom-0 w-full p-4 flex justify-between text-xs text-slate-500">
        <div>© 2026 Corporate Prode Platform</div>
        <div className="flex gap-2">
          <a href="#" className="hover:text-primary">Privacidad</a>
          <span>|</span>
          <a href="#" className="hover:text-primary">Términos</a>
          <span>|</span>
          <a href="#" className="hover:text-primary">Empresa</a>
        </div>
      </div>
    </div>
  );
}
