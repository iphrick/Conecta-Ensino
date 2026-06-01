"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ShieldAlert, LogOut, RefreshCw, GraduationCap, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function PendingPage() {
  const { profile, refreshProfile, logout } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [approvedMessage, setApprovedMessage] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refreshProfile();
      
      // Lê o cookie atualizado para redirecionar se ativado
      const matchStatus = document.cookie.match(/(?:^|; )conecta-status=([^;]*)/);
      const matchRole = document.cookie.match(/(?:^|; )conecta-role=([^;]*)/);
      
      const userStatus = matchStatus ? decodeURIComponent(matchStatus[1]) : "pending";
      const userRole = matchRole ? decodeURIComponent(matchRole[1]) : "student";

      if (userStatus === "approved") {
        setApprovedMessage(true);
        setTimeout(() => {
          if (userRole === "admin") router.push("/dashboard/admin");
          else if (userRole === "teacher") router.push("/dashboard/teacher");
          else router.push("/dashboard/student");
        }, 1500);
      } else {
        alert("Sua conta ainda está em análise pela Administração. Por favor, aguarde.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Círculo luminoso */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl -z-10" />

      {/* Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto pb-6 border-b border-border/40">
        <div className="flex items-center space-x-2 text-primary">
          <GraduationCap className="h-8 w-8" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">
            Conecta Ensino
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Corpo da Holding Page */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl relative space-y-7 text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500 animate-pulse" />

          {approvedMessage ? (
            /* Caso Aprovado */
            <div className="space-y-6 animate-enter">
              <div className="mx-auto h-16 w-16 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
                <CheckCircle className="h-10 w-10 fill-current" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xl text-emerald-600">Acesso Liberado!</h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Sua conta foi ativada pelo Administrador. Redirecionando você para seu painel...
                </p>
              </div>
            </div>
          ) : (
            /* Caso Pendente */
            <div className="space-y-6 animate-enter">
              {/* Relógio indicador de pendente */}
              <div className="mx-auto h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                <Clock className="h-9 w-9" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Aguardando Liberação</span>
                <h3 className="font-black text-xl">Conta em Análise de Acesso</h3>
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                  Olá, <span className="text-foreground font-black">{profile?.name}</span>. Seu cadastro foi recebido em nosso sistema EAD. 
                  Por motivos de segurança e moderação da plataforma, o acesso inicial é verificado e ativado por um **Administrador**.
                </p>
              </div>

              {/* Caixa informativa */}
              <div className="flex items-start text-left space-x-2.5 bg-secondary/50 border border-border p-4 rounded-2xl text-[11px] font-semibold text-muted-foreground">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Você pode usar a **Demonstração de 1 Clique** do login para logar instantaneamente como Admin e aprovar sua conta na aba **"Usuários"**!
                </span>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={checking}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] cursor-pointer transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 shrink-0 ${checking ? "animate-spin" : ""}`} />
                  <span>{checking ? "Verificando..." : "Checar Aprovação"}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive border border-border font-bold text-xs cursor-pointer transition-all"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        © {new Date().getFullYear()} Conecta Ensino. Suporte Moderador EAD.
      </footer>
    </div>
  );
}
