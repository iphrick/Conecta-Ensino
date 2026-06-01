"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Bell, Search, GraduationCap } from "lucide-react";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "teacher" | "admin")[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push("/login");
        return;
      }

      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        // Redireciona se tentar acessar rota proibida para seu perfil
        if (profile.role === "admin") router.push("/dashboard/admin");
        else if (profile.role === "teacher") router.push("/dashboard/teacher");
        else router.push("/dashboard/student");
      }
    }
  }, [profile, loading, router, allowedRoles]);

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <GraduationCap className="h-16 w-16 text-primary animate-bounce mb-4" />
        <div className="flex items-center space-x-2 text-muted-foreground font-medium animate-pulse">
          <span>Carregando Conecta Ensino...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Sidebar Lateral (Desktop e Mobile Drawer) */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Navbar Superior do Dashboard */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-card/85 backdrop-blur-md border-b border-border select-none">
          <div className="flex items-center space-x-4">
            {/* Botão de Hamburger Mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary border border-border cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Título do Painel de Acordo com a Role */}
            <h1 className="hidden sm:block font-semibold text-lg text-muted-foreground">
              Painel Integrado
            </h1>
          </div>

          {/* Ferramentas do Cabeçalho */}
          <div className="flex items-center space-x-4">
            {/* Notificações Mock */}
            <button 
              className="p-2 rounded-lg hover:bg-secondary border border-border text-muted-foreground transition-colors cursor-pointer relative"
              title="Notificações"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
            </button>
            
            {/* Informações Resumidas do Perfil */}
            <Link 
              href="/dashboard/profile"
              className="flex items-center space-x-3 border-l border-border pl-4 hover:opacity-85 transition-opacity"
              title="Meu Perfil"
            >
              <span className="hidden lg:block text-sm font-medium">{profile.name}</span>
              <img
                src={profile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`}
                alt={profile.name}
                className="h-8 w-8 rounded-full border border-primary object-cover"
              />
            </Link>
          </div>
        </header>

        {/* Corpo do Conteúdo do Painel */}
        <main className="flex-1 p-6 md:p-8 animate-slide overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
