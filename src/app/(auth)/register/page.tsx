"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { GraduationCap, Mail, Lock, User, AlertCircle, ArrowRight, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// Validador Zod do Formulário de Cadastro
const registerSchema = zod.object({
  name: zod.string().min(3, "O nome completo deve conter no mínimo 3 caracteres"),
  email: zod.string().email("Insira um endereço de e-mail válido"),
  password: zod.string().min(6, "A senha deve conter no mínimo 6 caracteres"),
  role: zod.enum(["student", "teacher", "admin"]),
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: signUpUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isAdminSecret = searchParams.get("admin") === "true";

  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "student" },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await signUpUser(data.name, data.email, data.password, data.role);
      
      if (data.role === "admin") router.push("/dashboard/admin");
      else if (data.role === "teacher") router.push("/dashboard/teacher");
      else router.push("/dashboard/student");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao realizar cadastro. Tente outro e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: "student" | "teacher" | "admin") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-background select-none">
      {/* Esquerda: Banner Informativo */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-indigo-700 via-violet-600 to-purple-800 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="flex items-center space-x-2 text-white">
          <GraduationCap className="h-10 w-10 text-white" />
          <span className="font-extrabold text-2xl tracking-wider">CONECTA ENSINO</span>
        </div>

        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-violet-200">
            <Sparkles className="h-4 w-4" />
            <span>Crie sua conta em 1 minuto</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Escolha como quer transformar o ensino.
          </h2>
          <p className="text-violet-100 font-medium text-sm md:text-base leading-relaxed">
            Seja um **Aluno** dedicado aprendendo com os melhores, ou um **Instrutor** publicando cursos profissionais, gerenciando módulos e acompanhando a evolução dos seus alunos.
          </p>
        </div>

        <p className="text-xs text-violet-300 font-medium">
          © {new Date().getFullYear()} Conecta Ensino. Todos os direitos reservados.
        </p>
      </div>

      {/* Direita: Formulário de Cadastro */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-7 animate-enter">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex md:hidden items-center space-x-2 text-primary mb-4">
              <GraduationCap className="h-10 w-10" />
              <span className="font-black text-xl">CONECTA</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Criar uma conta</h1>
            <p className="text-muted-foreground font-medium text-sm">
              Preencha os campos abaixo e escolha o seu tipo de perfil.
            </p>
          </div>

          {/* Alertas de erro */}
          {error && (
            <div className="flex items-start space-x-2 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-medium animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
            {/* Seletor de Tipo de Perfil (Role Selector) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Quero me cadastrar como:</label>
              <div className={`grid gap-3 ${isAdminSecret ? "grid-cols-3" : "grid-cols-2"}`}>
                <button
                  type="button"
                  onClick={() => handleRoleToggle("student")}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedRole === "student"
                      ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/25"
                      : "border-border bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <GraduationCap className="h-6 w-6 mb-1.5" />
                  <span className="text-sm font-bold truncate w-full">Aluno</span>
                  <span className="text-[10px] opacity-80 mt-0.5 truncate w-full">Assistir</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleToggle("teacher")}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedRole === "teacher"
                      ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/25"
                      : "border-border bg-card hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <ShieldCheck className="h-6 w-6 mb-1.5" />
                  <span className="text-sm font-bold truncate w-full">Instrutor</span>
                  <span className="text-[10px] opacity-80 mt-0.5 truncate w-full">Publicar</span>
                </button>

                {isAdminSecret && (
                  <button
                    type="button"
                    onClick={() => handleRoleToggle("admin")}
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedRole === "admin"
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/25"
                        : "border-border bg-card hover:bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Lock className="h-6 w-6 mb-1.5" />
                    <span className="text-sm font-bold truncate w-full">Admin</span>
                    <span className="text-[10px] opacity-80 mt-0.5 truncate w-full">Gestão</span>
                  </button>
                )}
              </div>
            </div>

            {/* Input Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Seu nome"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? "border-destructive focus:ring-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
              )}
            </div>

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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Criar uma Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Min. 6 caracteres"
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
                  <span>Registrar e Acessar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center font-medium text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
