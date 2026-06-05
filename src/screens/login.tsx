"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User, IdCard, Lock, Eye, EyeOff } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import cybLogo from "@/assets/cyb-logo.png";

const loginSchema = z.object({
  email: z.string().email("Ingresá un email corporativo válido"),
  password: z.string().min(6, "Ingresá tu contraseña"),
});

const registerSchema = z.object({
  email: z.string().email("Ingresá un email corporativo válido"),
  firstName: z.string().min(2, "Ingresá tu nombre"),
  lastName: z.string().min(2, "Ingresá tu apellido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Repetí la contraseña"),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function Login() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      router.push("/forecast");
    }
  }, [router]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", firstName: "", lastName: "", password: "", confirmPassword: "" },
  });

  function completeLogin(email: string) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email.trim().toLowerCase());
    localStorage.removeItem("userId");
    router.push("/forecast");
  }

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

    completeLogin(values.email);
  }

  async function onRegister(values: z.infer<typeof registerSchema>) {
    setIsRegistering(true);
    setRegisterError(null);
    const { confirmPassword: _confirmPassword, ...payload } = values;

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);
    setIsRegistering(false);

    if (!response.ok) {
      setRegisterError(result?.message ?? "No pudimos completar el registro. Intentá nuevamente.");
      return;
    }

    completeLogin(values.email);
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

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-600">CONTRASEÑA</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            className="pl-10 pr-10 py-6"
                            data-testid="input-password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 h-5 w-5 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowLoginPassword((value) => !value)}
                            aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
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

                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-600">CONTRASEÑA</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
                            className="pl-10 pr-10 py-6"
                            data-testid="input-register-password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 h-5 w-5 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowRegisterPassword((value) => !value)}
                            aria-label={showRegisterPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showRegisterPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-600">REPETIR CONTRASEÑA</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input
                            type={showRegisterConfirmPassword ? "text" : "password"}
                            placeholder="Repetí la contraseña"
                            className="pl-10 pr-10 py-6"
                            data-testid="input-register-confirm-password"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 h-5 w-5 text-slate-400 hover:text-slate-600"
                            onClick={() => setShowRegisterConfirmPassword((value) => !value)}
                            aria-label={showRegisterConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showRegisterConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
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
