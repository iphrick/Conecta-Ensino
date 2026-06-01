"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  Tv, 
  DollarSign, 
  PlusCircle, 
  GraduationCap, 
  TrendingUp,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Course } from "@/services/mockDb";
import { formatPrice } from "@/lib/utils";

export default function TeacherDashboard() {
  const { profile } = useAuth();
  
  // Estados de estatísticas
  const [coursesCount, setCoursesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      if (!profile) return;
      
      const allCourses = await mockDb.getCourses();
      const teacherCourses = allCourses.filter(c => c.teacherId === profile.id);
      setCoursesCount(teacherCourses.length);

      // Aulas
      const allLessons = await mockDb.getLessons();
      const allModules = await mockDb.getModules();
      
      let countL = 0;
      teacherCourses.forEach(c => {
        const mods = allModules.filter(m => m.courseId === c.id);
        mods.forEach(m => {
          const less = allLessons.filter(l => l.moduleId === m.id);
          countL += less.length;
        });
      });
      setLessonsCount(countL);

      // Alunos e Matrículas (Simulados a partir das matrículas)
      const allEnrollments = await mockDb.getEnrollments();
      // Conta matrículas associadas aos cursos do professor
      const courseIds = teacherCourses.map(c => c.id);
      const teacherEnrollments = allEnrollments.filter(e => courseIds.includes(e.courseId));
      setStudentsCount(teacherEnrollments.length);

      // Faturamento (Simula preço * matrículas)
      let revenue = 0;
      teacherEnrollments.forEach(e => {
        const c = teacherCourses.find(course => course.id === e.courseId);
        if (c) revenue += c.price;
      });
      setTotalRevenue(revenue);

      // Atividades Recentes
      const activities = teacherEnrollments.slice(0, 4).map(e => {
        const c = teacherCourses.find(course => course.id === e.courseId);
        return {
          id: e.id,
          studentName: "Aluno Matriculado",
          courseTitle: c ? c.title : "Curso do Professor",
          enrolledAt: new Date(e.enrolledAt).toLocaleDateString("pt-BR"),
          progress: e.progress
        };
      });
      setRecentActivities(activities);
    }

    loadStats();
  }, [profile]);

  return (
    <DashboardLayout allowedRoles={["teacher", "admin"]}>
      <div className="space-y-8 select-none w-full">
        
        {/* Cabeçalho de Boas Vindas */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Olá, {profile?.name}!</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Seja bem-vindo de volta ao seu painel de ensino. Aqui está a performance geral dos seus cursos.
            </p>
          </div>
          <Link
            href="/dashboard/teacher/courses"
            className="flex items-center space-x-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/10 hover:opacity-90 transition-all w-max cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Criar Novo Curso</span>
          </Link>
        </div>

        {/* 1. CARDS ESTATÍSTICOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Meus Cursos</span>
              <span className="text-3xl font-black block">{coursesCount}</span>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Alunos Matriculados</span>
              <span className="text-3xl font-black block">{studentsCount}</span>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Aulas Criadas</span>
              <span className="text-3xl font-black block">{lessonsCount}</span>
            </div>
            <div className="h-12 w-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 shrink-0 group-hover:scale-105 transition-transform">
              <Tv className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Faturamento Geral</span>
              <span className="text-3xl font-black block text-emerald-500">{formatPrice(totalRevenue)}</span>
            </div>
            <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 2. GRÁFICOS E ATIVIDADE RECENTE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráficos de Vendas Simulados (HTML5/CSS Premium) */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base flex items-center space-x-1.5">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Desempenho Semanal de Matrículas</span>
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">Projeção visual das inscrições nos últimos 6 dias.</p>
              </div>
            </div>

            {/* Barras do Gráfico */}
            <div className="flex items-end justify-between h-44 px-4 pt-4 border-b border-border/80 relative">
              {/* Linha guia de fundo */}
              <div className="absolute inset-x-0 top-12 border-t border-border/20" />
              <div className="absolute inset-x-0 top-24 border-t border-border/20" />

              {/* Barra segunda */}
              <div className="flex flex-col items-center space-y-2 w-10 group">
                <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded shadow border border-border">2</div>
                <div className="w-full bg-primary/20 hover:bg-primary rounded-t-lg transition-all" style={{ height: "40px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Seg</span>
              </div>

              {/* Barra terça */}
              <div className="flex flex-col items-center space-y-2 w-10 group">
                <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded shadow border border-border">5</div>
                <div className="w-full bg-primary/40 hover:bg-primary rounded-t-lg transition-all animate-pulse" style={{ height: "90px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Ter</span>
              </div>

              {/* Barra quarta */}
              <div className="flex flex-col items-center space-y-2 w-10 group">
                <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded shadow border border-border">3</div>
                <div className="w-full bg-primary/20 hover:bg-primary rounded-t-lg transition-all" style={{ height: "60px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Qua</span>
              </div>

              {/* Barra quinta */}
              <div className="flex flex-col items-center space-y-2 w-10 group">
                <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded shadow border border-border">7</div>
                <div className="w-full bg-primary/60 hover:bg-primary rounded-t-lg transition-all" style={{ height: "120px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Qui</span>
              </div>

              {/* Barra sexta */}
              <div className="flex flex-col items-center space-y-2 w-10 group">
                <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded shadow border border-border">4</div>
                <div className="w-full bg-primary/30 hover:bg-primary rounded-t-lg transition-all" style={{ height: "75px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Sex</span>
              </div>

              {/* Barra sábado */}
              <div className="flex flex-col items-center space-y-2 w-10 group">
                <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded shadow border border-border">9</div>
                <div className="w-full bg-gradient-to-t from-violet-500 to-indigo-600 rounded-t-lg transition-all" style={{ height: "145px" }} />
                <span className="text-[10px] font-bold text-muted-foreground">Sáb</span>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base flex items-center space-x-1.5">
                <UserCheck className="h-5 w-5 text-indigo-500" />
                <span>Matrículas Recentes</span>
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">Os últimos estudantes que entraram nos seus cursos.</p>
            </div>

            <div className="flex-1 space-y-4 pt-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-xs font-semibold text-muted-foreground">
                  Nenhuma matrícula efetuada nos seus cursos ainda.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(act.id)}`}
                        alt="Aluno"
                        className="h-8 w-8 rounded-full border border-primary shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">Estudante Conecta</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{act.courseTitle}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {act.progress}% progresso
                      </span>
                      <span className="text-[9px] block text-muted-foreground mt-0.5">{act.enrolledAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/dashboard/teacher/courses"
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-secondary text-secondary-foreground hover:text-primary hover:bg-secondary/80 font-bold text-xs shadow-sm transition-all"
            >
              <span>Gerenciar Meus Cursos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
