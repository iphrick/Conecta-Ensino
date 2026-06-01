"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  FolderTree, 
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { mockDb, Course, Enrollment, Category } from "@/services/mockDb";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [enrollmentsCount, setEnrollmentsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  
  useEffect(() => {
    async function loadAdminStats() {
      // 1. Cursos
      const allC = await mockDb.getCourses();
      setCoursesCount(allC.length);

      // 2. Matrículas
      const allE = await mockDb.getEnrollments();
      setEnrollmentsCount(allE.length);

      // 3. Faturamento consolidado
      let revenue = 0;
      allE.forEach(e => {
        const c = allC.find(course => course.id === e.courseId);
        if (c) revenue += c.price;
      });
      setTotalRevenue(revenue);

      // 4. Categorias
      const cats = await mockDb.getCategories();
      setCategoriesCount(cats.length);

      // 5. Usuários (Simula contagem)
      setUsersCount(148); // Valor representativo de produção
    }

    loadAdminStats();
  }, []);

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-8 select-none w-full animate-enter">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center space-x-2">
              <ShieldCheck className="h-6.5 w-6.5 text-primary shrink-0" />
              <span>Painel de Controle Administrador</span>
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Tenha uma visão holística sobre as finanças, engajamento dos alunos, ementa de instrutores e permissões da plataforma.
            </p>
          </div>
        </div>

        {/* 1. INDICADORES GERAIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm group">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total de Usuários</span>
              <span className="text-3xl font-black block">{usersCount}</span>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm group">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Cursos Ativos</span>
              <span className="text-3xl font-black block text-indigo-500">{coursesCount}</span>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm group">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Matrículas Ativas</span>
              <span className="text-3xl font-black block text-violet-500">{enrollmentsCount}</span>
            </div>
            <div className="h-12 w-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm group">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Faturamento Global</span>
              <span className="text-3xl font-black block text-emerald-500">{formatPrice(totalRevenue)}</span>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 2. TABELA DE CATEGORIAS E LINKS DE NAVEGAÇÃO ADMINISTRATIVA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Projeção de Faturamento Gráfico */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base flex items-center space-x-1.5">
                <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                <span>Desempenho Geral de Vendas EAD</span>
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">Análise de receita real faturada baseada nas matrículas.</p>
            </div>

            <div className="flex items-end justify-between h-44 px-4 pt-4 border-b border-border/80 relative">
              <div className="absolute inset-x-0 top-12 border-t border-border/20" />
              <div className="absolute inset-x-0 top-24 border-t border-border/20" />

              {/* Semanas */}
              <div className="flex flex-col items-center space-y-2 w-16 group">
                <div className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1 rounded shadow border border-border">R$ 189</div>
                <div className="w-8 bg-primary/20 hover:bg-primary rounded-t-lg transition-all" style={{ height: "30px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Semana 1</span>
              </div>

              <div className="flex flex-col items-center space-y-2 w-16 group">
                <div className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1 rounded shadow border border-border">R$ 420</div>
                <div className="w-8 bg-primary/40 hover:bg-primary rounded-t-lg transition-all" style={{ height: "70px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Semana 2</span>
              </div>

              <div className="flex flex-col items-center space-y-2 w-16 group">
                <div className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1 rounded shadow border border-border">R$ 890</div>
                <div className="w-8 bg-primary/60 hover:bg-primary rounded-t-lg transition-all" style={{ height: "110px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Semana 3</span>
              </div>

              <div className="flex flex-col items-center space-y-2 w-16 group">
                <div className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1 rounded shadow border border-border">R$ 1.250</div>
                <div className="w-8 bg-gradient-to-t from-violet-500 to-indigo-600 rounded-t-lg transition-all" style={{ height: "150px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Semana 4</span>
              </div>
            </div>
          </div>

          {/* Atalhos do Admin */}
          <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base flex items-center space-x-1.5">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                <span>Gestão Avançada</span>
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">Selecione uma área de controle para auditar os registros.</p>
            </div>

            <div className="flex-1 space-y-3.5 pt-4">
              <Link
                href="/dashboard/admin/users"
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/20 hover:bg-secondary/40 transition-all font-semibold text-xs text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <Users className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span>Gerenciar Usuários</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Trocar cargos e auditar perfis</span>
                  </div>
                </div>
                <ChevronRight className="h-4.5 w-4.5 text-muted-foreground" />
              </Link>

              <Link
                href="/dashboard/admin/categories"
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:border-primary/20 hover:bg-secondary/40 transition-all font-semibold text-xs text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <FolderTree className="h-5 w-5 text-indigo-500 shrink-0" />
                  <div className="flex flex-col">
                    <span>Gerenciar Categorias</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Visualizar e cadastrar tags</span>
                  </div>
                </div>
                <ChevronRight className="h-4.5 w-4.5 text-muted-foreground" />
              </Link>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center space-x-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider justify-center">
              <span>Status Sistema:</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-500">100% Operacional</span>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
