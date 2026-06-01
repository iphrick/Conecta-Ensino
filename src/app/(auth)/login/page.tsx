"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// Validador Zod do Formulário de Login
const loginSchema = zod.object({
  email: zod.string().email("Insira um endereço de e-mail válido"),
  password: zod.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

function LoginForm() {
  const { login, isMock } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      
      // Cookie de role deve ter sido setado no login
      const match = document.cookie.match(/(?:^|; )conecta-role=([^;]*)/);
      const userRole = match ? decodeURIComponent(match[1]) : "student";

      if (redirect) {
        router.push(redirect);
      } else {
        if (userRole === "admin") router.push("/dashboard/admin");
        else if (userRole === "teacher") router.push("/dashboard/teacher");
        else router.push("/dashboard/student");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  // Preenche dados padrão do Mock para testar rápido
  const quickFill = (email: string) => {
    setValue("email", email);
    setValue("password", "123456");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-background select-none">
      {/* Esquerda: Banner / Marketing visual */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-800 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Círculos decorativos brilhantes */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="flex items-center space-x-2 text-white">
          <GraduationCap className="h-10 w-10 text-white" />
          <span className="font-extrabold text-2xl tracking-wider">CONECTA ENSINO</span>
        </div>

        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-violet-200">
            <Sparkles className="h-4 w-4" />
            <span>A melhor plataforma EAD do Brasil</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Educação que transforma e conecta você ao futuro.
          </h2>
          <p className="text-violet-100 font-medium text-sm md:text-base leading-relaxed">
            Publique seus cursos com controle de instrutor ou aprenda com profissionais renomados através de um painel de alta performance.
          </p>
        </div>

        <p className="text-xs text-violet-300 font-medium">
          © {new Date().getFullYear()} Conecta Ensino. Todos os direitos reservados.
        </p>
      </div>

      {/* Direita: Formulário de Login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-8 animate-enter">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex md:hidden items-center space-x-2 text-primary mb-4">
              <GraduationCap className="h-10 w-10" />
              <span className="font-black text-xl">CONECTA</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Fazer login</h1>
            <p className="text-muted-foreground font-medium text-sm">
              Insira seus dados abaixo para acessar sua conta ou criar uma nova.
            </p>
          </div>

          {/* Alertas de erro */}
          {error && (
            <div className="flex items-start space-x-2 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Input E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Endereço de E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="exemplo@email.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.email ? "border-destructive focus:ring-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Sua Senha</label>
                <Link
                  href="/login?forgot=true"
                  className="text-xs font-bold text-primary hover:underline"
                  onClick={() => alert("Digite o e-mail no formulário e use a demonstração rápida ou redefina sua senha no Console do Firebase.")}
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.password ? "border-destructive focus:ring-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Entrar na plataforma</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Atalhos para preenchimento rápido (Demo / Mock Mode) */}
          {isMock && (
            <div className="bg-secondary/50 border border-border p-4 rounded-2xl space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Demonstração Rápida (Um Clique)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => quickFill("aluno@conecta.com")}
                  className="px-2 py-2 text-xs font-bold bg-card border border-border rounded-xl hover:bg-accent/15 cursor-pointer text-center truncate"
                >
                  🎓 Aluno
                </button>
                <button
                  onClick={() => quickFill("professor@conecta.com")}
                  className="px-2 py-2 text-xs font-bold bg-card border border-border rounded-xl hover:bg-accent/15 cursor-pointer text-center truncate"
                >
                  👨‍🏫 Instrutor
                </button>
                <button
                  onClick={() => quickFill("admin@conecta.com")}
                  className="px-2 py-2 text-xs font-bold bg-card border border-border rounded-xl hover:bg-accent/15 cursor-pointer text-center truncate"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>
          )}

          <div className="text-center font-medium text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Crie uma conta grátis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-semibold text-muted-foreground animate-pulse">Carregando Login...</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
