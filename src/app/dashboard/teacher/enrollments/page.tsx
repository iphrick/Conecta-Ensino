"use client";

import React, { useEffect, useState } from "react";
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Loader2,
  Users
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Course, Enrollment } from "@/services/mockDb";

interface EnrolledStudentRow {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhoto: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
}

export default function TeacherEnrollmentsPage() {
  const { profile } = useAuth();
  
  const [enrollments, setEnrollments] = useState<EnrolledStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadEnrollmentsData() {
      if (!profile) return;
      
      try {
        // 1. Carrega todos os cursos e filtra os do professor atual
        const allCourses = await mockDb.getCourses();
        const teacherCourses = allCourses.filter(c => c.teacherId === profile.id);
        const teacherCourseIds = teacherCourses.map(c => c.id);

        // 2. Carrega todas as matrículas
        const allEnrollments = await mockDb.getEnrollments();
        const teacherEnrollments = allEnrollments.filter(e => teacherCourseIds.includes(e.courseId));

        // 3. Lê usuários para cruzar informações de nome e foto
        const storedUsers = localStorage.getItem("c_users_list");
        const usersList = storedUsers ? JSON.parse(storedUsers) as any[] : [];

        // 4. Mapeia as matrículas para exibição rica
        const mapped: EnrolledStudentRow[] = teacherEnrollments.map(e => {
          const course = teacherCourses.find(c => c.id === e.courseId);
          const student = usersList.find(u => u.id === e.studentId);
          
          return {
            id: e.id,
            studentId: e.studentId,
            studentName: student ? student.name : "Aluno Integrado",
            studentEmail: student ? student.email : "aluno@conecta.com",
            studentPhoto: student ? student.photoURL : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(e.studentId)}`,
            courseId: e.courseId,
            courseTitle: course ? course.title : "Curso do EAD",
            enrolledAt: e.enrolledAt,
            progress: e.progress
          };
        });

        // Ordena por data de matrícula decrescente
        mapped.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
        setEnrollments(mapped);
      } catch (err) {
        console.error("Erro ao carregar matrículas:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEnrollmentsData();
  }, [profile]);

  // Filtra matrículas no cliente por busca
  const filtered = enrollments.filter(e => 
    e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout allowedRoles={["teacher", "admin"]}>
      <div className="space-y-8 select-none w-full animate-enter">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center space-x-2">
              <GraduationCap className="h-6.5 w-6.5 text-primary shrink-0" />
              <span>Controle de Matrículas</span>
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Visualize os alunos matriculados nos seus cursos, acompanhe a taxa de progresso e emita o status de conclusão.
            </p>
          </div>
        </div>

        {/* Barra de Busca e Estatísticas */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Busca */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por aluno, email ou curso..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Cards Rápidos de Apoio */}
          <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto">
            <div className="bg-card border border-border px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>Total Matriculados: <strong className="text-primary">{enrollments.length}</strong></span>
            </div>
            <div className="bg-card border border-border px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Concluídos: <strong className="text-emerald-500">{enrollments.filter(e => e.progress === 100).length}</strong></span>
            </div>
          </div>
        </div>

        {/* Tabela de Matrículas */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">Carregando matrículas dos alunos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <GraduationCap className="h-16 w-16 text-muted-foreground/50 animate-pulse" />
            <h3 className="font-extrabold text-lg">Nenhuma matrícula encontrada</h3>
            <p className="text-sm text-muted-foreground font-semibold max-w-sm">
              {searchTerm 
                ? "Nenhum resultado coincide com seus filtros de busca." 
                : "Os alunos matriculados nos seus cursos aparecerão listados aqui automaticamente."}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-semibold text-muted-foreground">
                <thead className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-6 py-4">Aluno</th>
                    <th className="px-6 py-4">Endereço E-mail</th>
                    <th className="px-6 py-4">Curso Inscrito</th>
                    <th className="px-6 py-4">Data da Inscrição</th>
                    <th className="px-6 py-4">Progresso Geral</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-secondary/20 transition-all text-foreground">
                      
                      {/* Aluno info */}
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <img
                          src={row.studentPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.studentName)}`}
                          alt={row.studentName}
                          className="h-8 w-8 rounded-full border border-primary object-cover shrink-0"
                        />
                        <span className="font-bold">{row.studentName}</span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 font-medium text-muted-foreground">{row.studentEmail}</td>

                      {/* Curso */}
                      <td className="px-6 py-4 flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-bold max-w-[200px] truncate">{row.courseTitle}</span>
                      </td>

                      {/* Data de Matricula */}
                      <td className="px-6 py-4 font-medium text-muted-foreground">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{new Date(row.enrolledAt).toLocaleDateString("pt-BR")}</span>
                        </span>
                      </td>

                      {/* Progresso */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 w-36">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-primary">{row.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                row.progress === 100 
                                  ? "bg-emerald-500" 
                                  : "bg-gradient-to-r from-violet-500 to-indigo-600"
                              }`}
                              style={{ width: `${row.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-max mx-auto block border ${
                          row.progress === 100
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse"
                        }`}>
                          {row.progress === 100 ? "Concluído" : "Em andamento"}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
