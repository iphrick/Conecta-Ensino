"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  X, 
  Edit3, 
  ShieldCheck, 
  Trash2,
  Calendar,
  AlertCircle,
  BookOpen
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Course } from "@/services/mockDb";
import { formatPrice } from "@/lib/utils";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

// Interface dos usuários cadastrados na demonstração com status
interface DemonstrationUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  role: "student" | "teacher" | "admin";
  status: "pending" | "approved";
  createdAt: string;
}

const DEMO_USERS: DemonstrationUser[] = [
  { id: "u-1", name: "Guilherme Silva (Aluno)", email: "aluno@conecta.com", photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100", role: "student", status: "approved", createdAt: new Date().toISOString() },
  { id: "u-2", name: "Professor Marcelo (Instrutor)", email: "professor@conecta.com", photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100", role: "teacher", status: "approved", createdAt: new Date().toISOString() },
  { id: "u-3", name: "Dr. Pedro (Admin)", email: "admin@conecta.com", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100", role: "admin", status: "approved", createdAt: new Date().toISOString() },
  { id: "u-4", name: "Laura Mendes", email: "laura@conecta.com", photoURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100", role: "student", status: "approved", createdAt: new Date().toISOString() },
  { id: "u-5", name: "Ana Clara Souza", email: "anaclara@conecta.com", photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100", role: "student", status: "approved", createdAt: new Date().toISOString() },
];

export default function AdminUsersPage() {
  const { profile, isMock } = useAuth();
  
  const [users, setUsers] = useState<DemonstrationUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal de Edição de Cargo
  const [selectedUser, setSelectedUser] = useState<DemonstrationUser | null>(null);
  const [targetRole, setTargetRole] = useState<"student" | "teacher" | "admin">("student");
  const [modalOpen, setModalOpen] = useState(false);

  // Modal de Aprovação e Matrícula de Aluno
  const [approvingStudent, setApprovingStudent] = useState<DemonstrationUser | null>(null);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState("");
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  useEffect(() => {
    // Carrega usuários de acordo com o modo (Mock ou Real Firebase)
    async function loadUsers() {
      if (isMock) {
        const stored = localStorage.getItem("c_users_list");
        if (stored) {
          const parsed = JSON.parse(stored) as any[];
          const mapped = parsed.map(u => ({
            ...u,
            status: u.status || "approved"
          }));
          setUsers(mapped);
        } else {
          localStorage.setItem("c_users_list", JSON.stringify(DEMO_USERS));
          setUsers(DEMO_USERS);
        }
      } else {
        try {
          const querySnapshot = await getDocs(collection(db, "users"));
          const list: DemonstrationUser[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || "",
              email: data.email || "",
              photoURL: data.photoURL || "",
              role: data.role || "student",
              status: data.status || "approved",
              createdAt: data.createdAt || new Date().toISOString()
            });
          });
          setUsers(list);
        } catch (err) {
          console.error("Erro ao carregar usuários do Firestore:", err);
        }
      }
    }

    loadUsers();

    // Carrega cursos ativos da plataforma para matrícula
    async function loadCourses() {
      const list = await mockDb.getCourses();
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourseForEnroll(list[0].id);
      }
    }
    loadCourses();
  }, [isMock]);

  const saveUsersList = (updated: DemonstrationUser[]) => {
    localStorage.setItem("c_users_list", JSON.stringify(updated));
    setUsers(updated);
  };

  const handleOpenRoleModal = (user: DemonstrationUser) => {
    setSelectedUser(user);
    setTargetRole(user.role);
    setModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.id === profile?.id) {
      alert("Por motivos de segurança, você não pode alterar seu próprio nível de administrador.");
      setModalOpen(false);
      return;
    }

    if (isMock) {
      const updated = users.map((u) => {
        if (u.id === selectedUser.id) {
          return { ...u, role: targetRole };
        }
        return u;
      });
      saveUsersList(updated);
    } else {
      try {
        const userDocRef = doc(db, "users", selectedUser.id);
        await updateDoc(userDocRef, { role: targetRole });
        setUsers(users.map((u) => u.id === selectedUser.id ? { ...u, role: targetRole } : u));
      } catch (err: any) {
        console.error("Erro ao alterar cargo no Firestore:", err);
        alert("Erro ao alterar cargo no Firestore: " + err.message);
      }
    }

    setModalOpen(false);
    alert(`Cargo de ${selectedUser.name} alterado com sucesso para ${targetRole === "admin" ? "Administrador" : targetRole === "teacher" ? "Instrutor" : "Aluno"}.`);
  };

  // Dispara ação de aprovação
  const handleApproveAction = async (user: DemonstrationUser) => {
    if (user.role === "student") {
      // Se for Aluno, abre o modal de seleção de curso para aprová-lo e matriculá-lo!
      setApprovingStudent(user);
      setEnrollModalOpen(true);
    } else {
      // Se for Professor/Admin, aprova imediatamente sem matricular em cursos
      if (isMock) {
        const updated = users.map((u) => {
          if (u.id === user.id) {
            return { ...u, status: "approved" as const };
          }
          return u;
        });
        saveUsersList(updated);
      } else {
        try {
          const userDocRef = doc(db, "users", user.id);
          await updateDoc(userDocRef, { status: "approved" });
          setUsers(users.map((u) => u.id === user.id ? { ...u, status: "approved" as const } : u));
        } catch (err: any) {
          console.error("Erro ao aprovar usuário no Firestore:", err);
          alert("Erro ao aprovar usuário no Firestore: " + err.message);
          return;
        }
      }
      alert(`Cadastro de ${user.name} foi APROVADO com sucesso! Acesso liberado.`);
    }
  };

  // Confirmação de Aprovação e Matrícula de Aluno
  const handleConfirmEnrollApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingStudent || !selectedCourseForEnroll) return;

    // 1. Gera a matrícula do Aluno no curso selecionado
    await mockDb.enrollInCourse(approvingStudent.id, selectedCourseForEnroll);

    // 2. Aprova o status do Aluno no sistema
    if (isMock) {
      const updated = users.map((u) => {
        if (u.id === approvingStudent.id) {
          return { ...u, status: "approved" as const };
        }
        return u;
      });
      saveUsersList(updated);
    } else {
      try {
        const userDocRef = doc(db, "users", approvingStudent.id);
        await updateDoc(userDocRef, { status: "approved" });
        setUsers(users.map((u) => u.id === approvingStudent.id ? { ...u, status: "approved" as const } : u));
      } catch (err: any) {
        console.error("Erro ao aprovar e matricular usuário no Firestore:", err);
        alert("Erro ao aprovar e matricular usuário no Firestore: " + err.message);
        return;
      }
    }
    
    // Busca dados do curso selecionado para exibição do feedback
    const matchedCourse = courses.find(c => c.id === selectedCourseForEnroll);

    setEnrollModalOpen(false);
    setApprovingStudent(null);
    alert(`Cadastro de ${approvingStudent.name} aprovado e matriculado com sucesso no curso: "${matchedCourse?.title || 'Curso EAD'}"! Acesso do aluno liberado.`);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === profile?.id) {
      alert("Você não pode excluir sua própria conta administrativa.");
      return;
    }

    if (confirm(`Deseja mesmo revogar o acesso e deletar a conta de ${name}?`)) {
      if (isMock) {
        const filtered = users.filter((u) => u.id !== id);
        saveUsersList(filtered);
      } else {
        try {
          const userDocRef = doc(db, "users", id);
          await deleteDoc(userDocRef);
          setUsers(users.filter((u) => u.id !== id));
        } catch (err: any) {
          console.error("Erro ao deletar usuário no Firestore:", err);
          alert("Erro ao deletar usuário no Firestore: " + err.message);
        }
      }
    }
  };

  // Filtra usuários no cliente
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-8 select-none w-full animate-enter">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center space-x-2">
              <Users className="h-6.5 w-6.5 text-primary shrink-0" />
              <span>Gerenciamento de Usuários</span>
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Aprove e matricule novos alunos pendentes em cursos da plataforma, altere cargos (roles) ou remova contas.
            </p>
          </div>
        </div>

        {/* Caixa de Busca */}
        <div className="flex items-center bg-card border border-border p-4 rounded-2xl shadow-sm max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* TABELA DE USUÁRIOS */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold text-muted-foreground">
              <thead className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Endereço E-mail</th>
                  <th className="px-6 py-4">Cargo / Nível</th>
                  <th className="px-6 py-4">Acesso / Status</th>
                  <th className="px-6 py-4">Cadastro</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/20 transition-all text-foreground">
                    
                    {/* Perfil */}
                    <td className="px-6 py-4 flex items-center space-x-3.5">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="h-9 w-9 rounded-full border border-primary object-cover"
                      />
                      <span className="font-bold">{user.name}</span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 font-medium text-muted-foreground">{user.email}</td>

                    {/* Cargo */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-max block ${
                        user.role === "admin"
                          ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                          : user.role === "teacher"
                          ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}>
                        {user.role === "admin" ? "Admin" : user.role === "teacher" ? "Instrutor" : "Aluno"}
                      </span>
                    </td>

                    {/* Status de Acesso */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-max block border ${
                        user.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}>
                        {user.status === "pending" ? "Pendente (Aprovar)" : "Ativo / Liberado"}
                      </span>
                    </td>

                    {/* Criado em */}
                    <td className="px-6 py-4 font-medium text-muted-foreground flex items-center space-x-1.5">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                    </td>

                    {/* Botões */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2.5">
                        {user.status === "pending" ? (
                          <button
                            onClick={() => handleApproveAction(user)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-[10px] font-extrabold cursor-pointer transition-colors shadow-sm animate-bounce"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Aprovar e Matricular</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary border border-border cursor-pointer transition-colors"
                            title="Alterar Cargo"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Alterar Cargo</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive border border-border hover:border-destructive/20 cursor-pointer"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: ALTERAR CARGO / ROLE */}
        {modalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-enter">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-secondary text-muted-foreground border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg">Alterar Privilégios</h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Modificando acesso de: <span className="text-primary font-bold">{selectedUser.name}</span>
                </p>
              </div>

              {/* Warning Alert */}
              <div className="flex items-start space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 p-4 rounded-xl text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>Modificar o cargo altera imediatamente os menus de dashboard visíveis e privilégios de escrita do usuário no banco Firestore.</span>
              </div>

              <form onSubmit={handleSaveRole} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Selecione o Novo Cargo</label>
                  <select
                    value={targetRole}
                    onChange={(e: any) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="student">Aluno (Assistir aulas + Certificados)</option>
                    <option value="teacher">Instrutor (Criar cursos + CRUD ementas + Uploads)</option>
                    <option value="admin">Administrador (Controle completo + Mudança de Cargos)</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold bg-secondary rounded-xl hover:bg-secondary/80 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow shadow-primary/20 hover:opacity-90 cursor-pointer"
                  >
                    Confirmar Alteração
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: APROVAR E MATRICULAR ALUNO EM CURSO */}
        {enrollModalOpen && approvingStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-enter">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
              <button 
                onClick={() => {
                  setEnrollModalOpen(false);
                  setApprovingStudent(null);
                }}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-secondary text-muted-foreground border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg flex items-center space-x-2">
                  <ShieldCheck className="h-5.5 w-5.5 text-emerald-500" />
                  <span>Aprovar & Matricular Aluno</span>
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Aprovando cadastro de: <span className="text-primary font-bold">{approvingStudent.name}</span>
                </p>
              </div>

              {/* Informativo */}
              <div className="flex items-start space-x-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-xl text-xs font-semibold">
                <BookOpen className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>Escolha em qual curso inicial da plataforma o aluno começará matriculado de forma automática ao liberar seu login.</span>
              </div>

              <form onSubmit={handleConfirmEnrollApproval} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Escolher Curso Estreante</label>
                  {courses.length === 0 ? (
                    <div className="text-xs text-destructive font-bold p-2.5 border border-destructive/20 rounded-xl bg-destructive/10">
                      Nenhum curso cadastrado na plataforma ainda. Crie um curso no Painel do Instrutor primeiro!
                    </div>
                  ) : (
                    <select
                      value={selectedCourseForEnroll}
                      onChange={(e) => setSelectedCourseForEnroll(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title} ({formatPrice(course.price)})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollModalOpen(false);
                      setApprovingStudent(null);
                    }}
                    className="px-4 py-2.5 text-xs font-bold bg-secondary rounded-xl hover:bg-secondary/80 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={courses.length === 0}
                    className="px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow shadow-primary/20 hover:opacity-90 cursor-pointer disabled:opacity-50"
                  >
                    Confirmar Liberação e Matrícula
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
