"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowRight, User, IdCard } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import cybLogo from "@/assets/cyb-logo.png";

const loginSchema = z.object({
  email: z.string().email("Ingresá un email corporativo válido"),
});

const registerSchema = z.object({
  email: z.string().email("Ingresá un email corporativo válido"),
  firstName: z.string().min(2, "Ingresá tu nombre"),
  lastName: z.string().min(2, "Ingresá tu apellido"),
});

export default function Login() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      router.push("/forecast");
    }
  }, [router]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", firstName: "", lastName: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoggingIn(true);
    setLoginError(null);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json().catch(() => null);
    setIsLoggingIn(false);

    if (!response.ok) {
      setLoginError(result?.message ?? "No pudimos validar tu email. Intentá nuevamente.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", result.user.email);
    localStorage.setItem("userId", String(result.user.id));
    router.push("/forecast");
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    setIsRegistering(true);
    setRegisterError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json().catch(() => null);
    setIsRegistering(false);

    if (!response.ok) {
      setRegisterError(result?.message ?? "No pudimos completar el registro. Intentá nuevamente.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", result.user.email);
    localStorage.setItem("userId", String(result.user.id));
    router.push("/forecast");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF2F7] to-[#E2E8F0] flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        <div className="h-40 w-40 rounded-xl  shadow-sm flex items-center justify-center p-2">
          <Image
            src={cybLogo}
            alt="Cybermapa"
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <h1 className="text-primary font-bold text-2xl tracking-wide">
          Prode Mundial 2026 - Cybermapa
        </h1>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-lg border p-8">
        <div className="text-center mb-8">
          <p className="text-slate-500 text-sm">Ingresá con tu email de la empresa para participar</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="login">Ingresar</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
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

                {loginError ? (
                  <p className="text-sm font-medium text-destructive" role="alert">
                    {loginError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full py-2 text-base"
                  data-testid="btn-login"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? "Validando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                <FormField
                  control={registerForm.control}
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
                            data-testid="input-register-email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-600">NOMBRE</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input
                            placeholder="Nombre"
                            className="pl-10 py-6"
                            data-testid="input-first-name"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-600">APELLIDO</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input
                            placeholder="Apellido"
                            className="pl-10 py-6"
                            data-testid="input-last-name"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {registerError ? (
                  <p className="text-sm font-medium text-destructive" role="alert">
                    {registerError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full py-2 text-base"
                  data-testid="btn-register"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Registrando..." : "Crear cuenta"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
