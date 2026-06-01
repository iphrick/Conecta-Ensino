"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  Settings, 
  Users, 
  FolderTree, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  UserCircle,
  FileBarChart2,
  Trophy
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "teacher": return "Instrutor";
      default: return "Aluno";
    }
  };

  // Define itens de menu por perfil
  const getMenuItems = () => {
    const role = profile?.role || "student";
    
    switch (role) {
      case "admin":
        return [
          { label: "Visão Geral", icon: LayoutDashboard, href: "/dashboard/admin" },
          { label: "Usuários", icon: Users, href: "/dashboard/admin/users" },
          { label: "Categorias", icon: FolderTree, href: "/dashboard/admin/categories" },
          { label: "Cursos", icon: BookOpen, href: "/dashboard/teacher/courses" },
          { label: "Meu Perfil", icon: UserCircle, href: "/dashboard/profile" },
        ];
      case "teacher":
        return [
          { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/teacher" },
          { label: "Meus Cursos", icon: BookOpen, href: "/dashboard/teacher/courses" },
          { label: "Matrículas", icon: GraduationCap, href: "/dashboard/teacher/enrollments" },
          { label: "Meu Perfil", icon: UserCircle, href: "/dashboard/profile" },
        ];
      default: // student
        return [
          { label: "Painel do Aluno", icon: LayoutDashboard, href: "/dashboard/student" },
          { label: "Meus Cursos", icon: BookOpen, href: "/dashboard/student" },
          { label: "Certificados", icon: Trophy, href: "/dashboard/student/certificates" },
          { label: "Meu Perfil", icon: UserCircle, href: "/dashboard/profile" },
        ];
    }
  };

  const menuItems = getMenuItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border transition-all duration-300">
      {/* Cabeçalho do Logo */}
      <div className={`p-6 flex items-center ${collapsed ? "justify-center" : "justify-between"} border-b border-border`}>
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">
              Conecta Ensino
            </span>
          </Link>
        )}
        {collapsed && <GraduationCap className="h-8 w-8 text-primary animate-pulse" />}
        
        {/* Botão de colapsar no desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-secondary text-muted-foreground border border-border cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Perfil do Usuário Logado */}
      <div className="p-4 border-b border-border flex items-center space-x-3 overflow-hidden">
        <img
          src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name || "User")}`}
          alt={profile?.name || "Avatar"}
          className="h-10 w-10 rounded-full border-2 border-primary object-cover shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">{profile?.name || "Carregando..."}</span>
            <span className="text-[11px] font-medium text-primary bg-accent/20 px-2 py-0.5 rounded-full w-max mt-0.5">
              {getRoleBadge(profile?.role || "student")}
            </span>
          </div>
        )}
      </div>

      {/* Links do Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-14 scale-0 group-hover:scale-100 transition-transform bg-foreground text-background text-xs rounded px-2 py-1 z-50 whitespace-nowrap shadow-md">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Roda-pé da Sidebar */}
      <div className="p-4 border-t border-border space-y-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} space-x-2`}>
          <ThemeToggle />
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive hover:text-white rounded-lg transition-colors cursor-pointer w-full justify-center"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="flex p-2 rounded-lg hover:bg-destructive/10 text-destructive border border-destructive/20 cursor-pointer justify-center mx-auto"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar para desktop */}
      <aside className={`hidden md:block h-screen sticky top-0 shrink-0 select-none transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
        {sidebarContent}
      </aside>

      {/* Sidebar para mobile (Drawer) */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Overlay escuro de fundo */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setMobileOpen(false)}
        />
        
        {/* Gaveta lateral da Sidebar */}
        <div className={`absolute left-0 top-0 bottom-0 w-64 shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
