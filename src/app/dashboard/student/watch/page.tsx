"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Tv, 
  Clock, 
  ChevronRight, 
  Menu, 
  Award,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Course, Module, Lesson, Enrollment } from "@/services/mockDb";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import confetti from "canvas-confetti";

function WatchPlayerContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";

  // Estados principais
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);

  // Aula selecionada atualmente
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>("");

  // Responsividade
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Referência do player de vídeo HTML5
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadWatchData() {
      if (!profile || !courseId) return;

      const c = await mockDb.getCourseById(courseId);
      if (!c) {
        alert("Curso não encontrado.");
        router.push("/dashboard/student");
        return;
      }
      setCourse(c);

      // Carrega matrícula
      const enroll = await mockDb.getEnrollment(profile.id, c.id);
      if (!enroll) {
        alert("Você precisa se matricular no curso primeiro!");
        router.push(`/courses/${c.id}`);
        return;
      }
      setEnrollment(enroll);

      // Carrega módulos do curso
      const mods = await mockDb.getModulesByCourse(c.id);
      setModules(mods);

      // Carrega aulas por módulo
      const map: Record<string, Lesson[]> = {};
      let firstLesson: Lesson | null = null;
      let firstModId = "";

      for (const m of mods) {
        const lessons = await mockDb.getLessonsByModule(m.id);
        map[m.id] = lessons;
        
        // Define a primeira aula por padrão se nenhuma estiver ativa ainda
        if (lessons.length > 0 && !firstLesson) {
          firstLesson = lessons[0];
          firstModId = m.id;
        }
      }
      setLessonsMap(map);

      if (firstLesson) {
        setActiveLesson(firstLesson);
        setActiveModuleId(firstModId);
      }

      setLoading(false);
    }

    loadWatchData();
  }, [profile, courseId, router]);

  // Alterna o status de conclusão da aula ativa
  const toggleLessonCompletion = async (lesId: string, modId: string) => {
    if (!profile || !course || !enrollment) return;

    const isCompletedNow = !enrollment.completedLessons.includes(lesId);
    
    try {
      const updatedEnroll = await mockDb.completeLesson(
        profile.id,
        course.id,
        lesId,
        isCompletedNow
      );
      
      setEnrollment(updatedEnroll);

      // Se acabou de atingir 100% de progresso, comemora com CONFETES!
      if (isCompletedNow && updatedEnroll.progress === 100) {
        triggerConfetti();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const triggerConfetti = () => {
    // Explosão central de confetes
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    // Disparos laterais adicionais para dar o toque premium
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
    }, 250);
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
    }, 400);
  };

  // Carrega nova aula no player
  const selectLesson = (lesson: Lesson, moduleId: string) => {
    setActiveLesson(lesson);
    setActiveModuleId(moduleId);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  if (loading || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Tv className="h-14 w-14 text-primary animate-bounce mb-3" />
        <span className="text-sm font-semibold text-muted-foreground animate-pulse">Carregando player...</span>
      </div>
    );
  }

  const isCompleted = (lesId: string) => enrollment?.completedLessons.includes(lesId) || false;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden select-none">
      {/* 1. CABEÇALHO DO WATCH PLAYER */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/student"
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Voltar ao Painel"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-col min-w-0">
            <h2 className="font-extrabold text-sm truncate">{course.title}</h2>
            <span className="text-[10px] text-zinc-500 font-semibold truncate">Por {course.teacherName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          <div className="hidden sm:flex items-center space-x-2 bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700/50">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase">Progresso:</span>
            <span className="text-xs font-black text-emerald-400">{enrollment?.progress}%</span>
          </div>
          {enrollment?.progress === 100 && (
            <Link
              href="/dashboard/student/certificates"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-extrabold text-[10px] shadow shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.99] transition-all"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Ver Certificado</span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* 2. AREA CENTRAL DO PLAYER (VÍDEO E MENU LATERAL) */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Esquerda: Player de Vídeo e Ementa sob o player */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-black">
          {/* Player HTML5 */}
          <div className="relative aspect-video w-full max-h-[70vh] bg-black">
            {activeLesson ? (
              <video
                ref={videoRef}
                key={activeLesson.id}
                src={activeLesson.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={course.thumbnail}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <Play className="h-12 w-12 text-primary animate-pulse" />
                <p className="text-xs font-semibold text-zinc-400">Nenhuma aula selecionada</p>
              </div>
            )}
          </div>

          {/* Rodapé da Aula (Descrição) */}
          <div className="p-6 md:p-8 space-y-4 max-w-4xl w-full mx-auto text-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-5">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-extrabold">{activeLesson?.title}</h3>
                <p className="text-xs text-zinc-500 font-semibold flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Duração estimada: {activeLesson?.duration} minutos</span>
                </p>
              </div>

              {/* Botão de Marcar como Concluída */}
              {activeLesson && (
                <button
                  onClick={() => toggleLessonCompletion(activeLesson.id, activeModuleId)}
                  className={`flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all ${
                    isCompleted(activeLesson.id)
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                  }`}
                >
                  <CheckCircle className={`h-4.5 w-4.5 shrink-0 ${isCompleted(activeLesson.id) ? "fill-current" : ""}`} />
                  <span>{isCompleted(activeLesson.id) ? "Aula Concluída" : "Marcar como Concluída"}</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sobre esta aula</h4>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-zinc-400">
                {activeLesson?.description || "Nenhuma descrição complementar disponível para esta aula."}
              </p>
            </div>
          </div>
        </div>

        {/* Direita: Ementa de Módulos (Watch Sidebar) */}
        <aside className={`w-80 shrink-0 border-l border-zinc-800 bg-zinc-900 flex flex-col h-full transition-all duration-300 ${sidebarOpen ? "translate-x-0 block" : "translate-x-full hidden"}`}>
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <span className="font-extrabold text-xs text-zinc-400 uppercase tracking-wider">Conteúdo Programático</span>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Rolo de Módulos e Aulas */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800">
            {modules.map((m) => {
              const lessons = lessonsMap[m.id] || [];
              return (
                <div key={m.id} className="p-4 space-y-3 bg-zinc-900/60">
                  <h4 className="font-extrabold text-xs text-zinc-300 line-clamp-1">
                    {m.order}. {m.title}
                  </h4>

                  <div className="space-y-2">
                    {lessons.map((les) => {
                      const isActive = activeLesson?.id === les.id;
                      const completed = isCompleted(les.id);
                      return (
                        <button
                          key={les.id}
                          onClick={() => selectLesson(les, m.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                            isActive
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 pr-3 min-w-0">
                            {/* Checkbox interativo */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLessonCompletion(les.id, m.id);
                              }}
                              className={`h-4.5 w-4.5 rounded flex items-center justify-center shrink-0 cursor-pointer transition-all border ${
                                completed
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-zinc-700 hover:border-primary"
                              }`}
                            >
                              {completed && <CheckCircle className="h-3 w-3 fill-current" />}
                            </div>
                            <span className="text-[11px] font-semibold truncate leading-tight">{les.title}</span>
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500 shrink-0">{les.duration}m</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Botão flutuante para reabrir Sidebar quando fechada */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute right-4 top-4 p-2 rounded-xl bg-primary text-primary-foreground shadow-lg hover:opacity-90 cursor-pointer z-10"
            title="Abrir Ementa"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function WatchCoursePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <span className="text-xs font-semibold text-zinc-500 animate-pulse">Carregando player de vídeo...</span>
      </div>
    }>
      <WatchPlayerContent />
    </Suspense>
  );
}
