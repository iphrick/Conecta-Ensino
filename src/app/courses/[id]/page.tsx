"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  BookOpen, 
  Calendar, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  Lock, 
  Award, 
  Users,
  CheckCircle,
  FileText,
  Star
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Course, Module, Lesson } from "@/services/mockDb";
import { formatPrice, formatDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { profile, isMock } = useAuth();
  const router = useRouter();

  // Estados do Curso
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  
  // Estados de Estado do Aluno
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourseDetails() {
      const c = await mockDb.getCourseById(id);
      if (!c) return;
      setCourse(c);

      // Carrega módulos do curso
      const mods = await mockDb.getModulesByCourse(c.id);
      setModules(mods);

      // Carrega aulas por módulo
      const map: Record<string, Lesson[]> = {};
      for (const m of mods) {
        const lessons = await mockDb.getLessonsByModule(m.id);
        map[m.id] = lessons;
      }
      setLessonsMap(map);

      // Abre o primeiro módulo por padrão
      if (mods.length > 0) {
        setExpandedModule(mods[0].id);
      }

      // Checa se o aluno logado já está matriculado
      if (profile && profile.role === "student") {
        const enroll = await mockDb.getEnrollment(profile.id, c.id);
        setIsEnrolled(!!enroll);
      }
    }

    loadCourseDetails();
  }, [id, profile]);

  const handleEnroll = async () => {
    if (!profile) {
      // Se não logado, manda pro login com retorno seguro
      router.push(`/login?redirect=/courses/${id}`);
      return;
    }

    if (profile.role !== "student") {
      alert("Apenas contas com perfil de Aluno podem se matricular em cursos. Seu perfil atual é: " + profile.role);
      return;
    }

    setLoadingEnroll(true);
    try {
      if (course) {
        await mockDb.enrollInCourse(profile.id, course.id);
        setIsEnrolled(true);
        // Toast alert simples
        alert("Matrícula efetuada com sucesso! Bons estudos.");
        // Redireciona para o player de assistir
        router.push(`/dashboard/student/courses`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao efetuar matrícula.");
    } finally {
      setLoadingEnroll(false);
    }
  };

  if (!course) {
    return (
      <PublicLayout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <BookOpen className="h-12 w-12 text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-bold">Carregando detalhes do curso...</h2>
        </div>
      </PublicLayout>
    );
  }

  // Contagem total de aulas
  const totalLessons = Object.values(lessonsMap).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <PublicLayout>
      <div className="flex-1 bg-background select-none pb-20 w-full overflow-x-hidden">
        
        {/* BANNER / HERO DO CURSO */}
        <section className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white py-12 lg:py-20 relative">
          <div className="absolute inset-0 bg-grid-white/[0.03] -z-10" />
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* Esquerda: Info do Banner */}
            <div className="lg:col-span-2 space-y-6">
              <Link
                href="/courses"
                className="inline-flex items-center space-x-2 text-xs font-bold text-violet-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar ao catálogo</span>
              </Link>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                {course.description}
              </p>

              {/* Badges de Metadados */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800/80 text-xs font-semibold text-slate-300">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4.5 w-4.5 text-violet-400" />
                  <span>{formatDuration(course.duration)} totais</span>
                </span>
                <span className="flex items-center space-x-1">
                  <BookOpen className="h-4.5 w-4.5 text-violet-400" />
                  <span>{totalLessons} aulas</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="h-4.5 w-4.5 text-amber-400 fill-current" />
                  <span className="text-white font-bold">4.9</span>
                  <span>(128 avaliações)</span>
                </span>
              </div>

              {/* Informações do Professor */}
              <div className="flex items-center space-x-3.5 pt-2">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.teacherName)}`}
                  alt={course.teacherName}
                  className="h-10 w-10 rounded-full border-2 border-violet-500"
                />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Professor responsável</p>
                  <p className="text-sm font-bold text-white">{course.teacherName}</p>
                </div>
              </div>
            </div>

            {/* Direita: Card de Compra / Matrícula */}
            <div className="lg:col-span-1 bg-card text-foreground border border-border rounded-3xl p-6 shadow-2xl flex flex-col space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600" />
              
              <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 text-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Preço Promocional</span>
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-3xl font-black text-primary">{formatPrice(course.price)}</span>
                </div>
                <p className="text-[10px] text-emerald-500 font-bold">Acesso vitalício + certificado incluso</p>
              </div>

              {/* CTA Condicional */}
              {isEnrolled ? (
                <Link
                  href="/dashboard/student/courses"
                  className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-[0.99] transition-all text-center"
                >
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>Continuar Assistindo</span>
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={loadingEnroll}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingEnroll ? "Processando..." : "Matricular-se Agora"}
                </button>
              )}

              {/* Lista rápida de garantias */}
              <div className="space-y-2.5 pt-4 border-t border-border text-xs font-semibold text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Award className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                  <span>Garantia de certificado verificado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                  <span>Assista quando e onde quiser</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4.5 w-4.5 text-violet-500 shrink-0" />
                  <span>Exercícios e fórum de dúvidas</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* EMENTA PROGRAMÁTICA (CURRICULUM TREE) */}
        <section className="mx-auto max-w-7xl px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Ementa e Grade do Curso */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight">O que você vai aprender</h2>
            
            {/* Lista de Módulos Accordion */}
            <div className="space-y-4">
              {modules.map((m) => {
                const lessons = lessonsMap[m.id] || [];
                const isExpanded = expandedModule === m.id;
                return (
                  <div
                    key={m.id}
                    className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    {/* Botão de Toggle do Módulo */}
                    <button
                      onClick={() => setExpandedModule(isExpanded ? null : m.id)}
                      className="w-full flex items-center justify-between p-5 font-extrabold text-sm sm:text-base text-left hover:text-primary transition-colors cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center space-x-3.5 pr-4">
                        <span className="h-6.5 w-6.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">
                          {m.order}
                        </span>
                        <span className="line-clamp-1">{m.title}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground font-semibold shrink-0">
                        <span>{lessons.length} aulas</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                          {formatDuration(lessons.reduce((acc, curr) => acc + curr.duration, 0))}
                        </span>
                        <ChevronRight className={`h-4.5 w-4.5 transition-transform ${isExpanded ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </button>

                    {/* Aulas do Módulo */}
                    {isExpanded && (
                      <div className="border-t border-border/40 bg-background/50 divide-y divide-border/40 animate-enter">
                        {lessons.length === 0 ? (
                          <div className="p-4 text-center text-xs font-semibold text-muted-foreground">
                            Nenhuma aula cadastrada neste módulo ainda.
                          </div>
                        ) : (
                          lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-4 pl-8 hover:bg-secondary/40 text-xs font-semibold transition-all group"
                            >
                              <div className="flex items-center space-x-3 pr-4">
                                <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                                <span className="text-muted-foreground font-bold shrink-0">{lesson.order}.</span>
                                <span className="text-foreground line-clamp-1">{lesson.title}</span>
                              </div>
                              <div className="flex items-center space-x-3 shrink-0 text-muted-foreground">
                                <span>{lesson.duration} min</span>
                                <Lock className="h-3.5 w-3.5" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requisitos e Informações complementares */}
          <div className="lg:col-span-1 space-y-8">
            {/* Caixa de Requisitos */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <h3 className="font-extrabold text-base">Requisitos recomendados</h3>
              <ul className="space-y-3 text-xs font-semibold text-muted-foreground">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>Computador ou smartphone com acesso à internet estável</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>Conhecimento básico e familiaridade com tecnologia</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>Desejo de aprender com metodologia prática</span>
                </li>
              </ul>
            </div>
          </div>

        </section>

      </div>
    </PublicLayout>
  );
}
