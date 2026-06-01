"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X, ArrowRight, UserCircle, LayoutDashboard, Globe, Award, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Cursos", href: "/courses" },
  ];

  const getDashboardHref = () => {
    if (!profile) return "/login";
    if (profile.role === "admin") return "/dashboard/admin";
    if (profile.role === "teacher") return "/dashboard/teacher";
    return "/dashboard/student";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar Superior Pública */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md transition-colors select-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">
              Conecta Ensino
            </span>
          </Link>

          {/* Links para Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-primary ${
                    isActive ? "text-primary border-b-2 border-primary py-1" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Ações (Botoes de Login/Dashboard e Theme) */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {profile ? (
              <Link
                href={getDashboardHref()}
                className="flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-sm font-bold transition-all"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Acessar Painel</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold hover:text-primary transition-colors px-3 py-2"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/10 hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  <span>Criar Conta</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Menu Mobile Hamburger */}
          <div className="flex md:hidden items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground border border-border"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>
          </div>
        </div>

        {/* Links para Mobile (Dropdown Drawer) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-6 py-4 space-y-4 animate-enter absolute top-16 left-0 right-0 shadow-lg z-50">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  href={link.href}
                  className={`text-sm font-bold block ${pathname === link.href ? "text-primary" : "text-muted-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-border pt-4 flex flex-col space-y-3">
              {profile ? (
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm text-center"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Ir para o meu Painel</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-bold text-center py-2.5 rounded-xl border border-border hover:bg-secondary block"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-1.5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md"
                  >
                    <span>Criar Conta</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer Público */}
      <footer className="bg-card border-t border-border mt-auto select-none">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2 mb-6 md:mb-0">
            <Link href="/courses" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Catálogo de Cursos
            </Link>
            <span className="text-border">|</span>
            <span className="text-sm font-semibold text-muted-foreground flex items-center space-x-1">
              <Award className="h-4.5 w-4.5 text-amber-500 shrink-0" />
              <span>Certificação Válida</span>
            </span>
            <span className="text-border">|</span>
            <span className="text-sm font-semibold text-muted-foreground flex items-center space-x-1">
              <Globe className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Suporte EAD</span>
            </span>
          </div>
          <div className="md:order-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2.5 text-primary mb-2">
              <GraduationCap className="h-6 w-6" />
              <span className="font-extrabold tracking-tight">Conecta Ensino EAD</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Conecta Ensino. Desenvolvido com carinho para professores e alunos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
