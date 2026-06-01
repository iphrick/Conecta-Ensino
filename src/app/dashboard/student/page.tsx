"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Play, 
  CheckCircle2, 
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Course, Enrollment, Certificate } from "@/services/mockDb";

export default function StudentDashboard() {
  const { profile } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    async function loadStudentData() {
      if (!profile) return;
      
      // Carrega matrículas do aluno
      const studentEnrollments = await mockDb.getEnrollmentsByStudent(profile.id);
      setEnrollments(studentEnrollments);

      // Carrega os detalhes dos cursos correspondentes
      const allCourses = await mockDb.getCourses();
      const enrolledCourses = allCourses.filter(c => 
        studentEnrollments.some(e => e.courseId === c.id)
      );
      setCourses(enrolledCourses);

      // Carrega certificados já obtidos
      const certs = await mockDb.getCertificatesByStudent(profile.id);
      setCertificates(certs);
    }

    loadStudentData();
  }, [profile]);

  // Calcula estatísticas gerais
  const totalCourses = enrollments.length;
  const certificatesCount = certificates.length;
  const overallProgress = totalCourses > 0 
    ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / totalCourses) 
    : 0;

  return (
    <DashboardLayout allowedRoles={["student", "teacher", "admin"]}>
      <div className="space-y-8 select-none w-full animate-enter">
        
        {/* Cabeçalho de Boas Vindas */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center space-x-2">
              <span>Bons estudos, {profile?.name}!</span>
              <Sparkles className="h-5.5 w-5.5 text-amber-500 animate-pulse shrink-0" />
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Acompanhe seu progresso, assista a aulas de alta performance e emita seus certificados.
            </p>
          </div>
          <Link
            href="/courses"
            className="flex items-center justify-center space-x-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/10 hover:opacity-90 transition-all w-max cursor-pointer"
          >
            <span>Explorar Novos Cursos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 1. CARDS DE DESEMPENHO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Total Cursos */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm group">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Cursos Matriculados</span>
              <span className="text-3xl font-black block">{totalCourses}</span>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Progresso Geral */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm group">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Progresso Geral</span>
              <span className="text-3xl font-black block text-indigo-500">{overallProgress}%</span>
            </div>
            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Certificados Obtidos */}
          <div className="p-6 rounded-2xl bg-card border border-border flex items-center justify-between shadow-sm group">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Meus Certificados</span>
              <span className="text-3xl font-black block text-amber-500">{certificatesCount}</span>
            </div>
            <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* 2. MEUS CURSOS (LISTAGEM COM PROGRESSO) */}
        <div className="space-y-5">
          <h3 className="font-extrabold text-lg flex items-center space-x-2">
            <Play className="h-5 w-5 text-primary shrink-0 fill-current" />
            <span>Continuar Assistindo</span>
          </h3>

          {enrollments.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
              <BookOpen className="h-16 w-16 text-muted-foreground/60 animate-pulse" />
              <h3 className="font-extrabold text-lg">Você não está matriculado em nenhum curso</h3>
              <p className="text-sm text-muted-foreground font-semibold max-w-sm">
                Explore nosso catálogo público e matricule-se gratuitamente nos melhores treinamentos do mercado.
              </p>
              <Link
                href="/courses"
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow hover:opacity-90 transition-all cursor-pointer"
              >
                Ir para o Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => {
                const enrollment = enrollments.find(e => e.courseId === course.id);
                const progress = enrollment ? enrollment.progress : 0;
                
                return (
                  <div
                    key={course.id}
                    className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-40 w-full shrink-0 overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3.5 left-3.5 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {course.level}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-5">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h4>
                        <span className="text-[10px] font-bold text-muted-foreground">Por {course.teacherName}</span>
                      </div>

                      {/* Barra de Progresso Visual */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-muted-foreground">Seu progresso</span>
                          <span className="text-primary">{progress}% concluído</span>
                        </div>
                        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-violet-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center justify-between gap-4 pt-2">
                        {progress === 100 ? (
                          <Link
                            href="/dashboard/student/certificates"
                            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-500/20 text-xs font-extrabold transition-all"
                          >
                            <Award className="h-4.5 w-4.5" />
                            <span>Ver Certificado</span>
                          </Link>
                        ) : (
                          <div className="h-4" /> /* Espaçador */
                        )}

                        <Link
                          href={`/dashboard/student/watch?courseId=${course.id}`}
                          className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md shadow-primary/10 hover:opacity-90 transition-all cursor-pointer"
                        >
                          <Play className="h-4 w-4 shrink-0 fill-current" />
                          <span>Assistir Aulas</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
