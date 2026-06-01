"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { 
  User, 
  Mail, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Validador Zod do Formulário de Perfil (Suporta URLs tradicionais, Base64 de uploads locais e vazios)
const profileSchema = zod.object({
  name: zod.string().min(3, "O nome deve conter no mínimo 3 caracteres"),
  photoURL: zod.string()
    .refine((val) => {
      if (val === "") return true;
      if (val.startsWith("data:image/")) return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Insira uma URL de imagem válida ou faça o upload de uma imagem do computador")
    .or(zod.literal("")),
});

type ProfileFormValues = zod.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { profile, updateProfileState, isMock } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      photoURL: profile?.photoURL || "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida se é imagem
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Valida tamanho da imagem (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 4MB.");
      return;
    }

    setAvatarUploading(true);
    setSuccess(null);
    setError(null);

    try {
      let finalUrl = "";

      if (isMock) {
        // --- Modo Mock (Base64) ---
        const reader = new FileReader();
        finalUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Erro ao ler o arquivo de imagem."));
          reader.readAsDataURL(file);
        });

        // Inicializa ou lê a lista dinâmica de usuários do LocalStorage
        const usersList = localStorage.getItem("c_users_list");
        let list: any[] = [];
        if (usersList) {
          list = JSON.parse(usersList) as any[];
        } else {
          list = [
            { id: "mock-admin-uid", name: "Dr. Pedro (Admin)", email: "admin@conecta.com", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100", role: "admin", status: "approved", createdAt: new Date().toISOString() },
            { id: "mock-teacher-uid", name: "Professor Marcelo (Instrutor)", email: "professor@conecta.com", photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100", role: "teacher", status: "approved", createdAt: new Date().toISOString() },
            { id: "mock-student-uid", name: "Guilherme Silva (Aluno)", email: "aluno@conecta.com", photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100", role: "student", status: "approved", createdAt: new Date().toISOString() }
          ];
        }

        if (profile) {
          const exists = list.some(u => u.id === profile.id);
          if (exists) {
            list = list.map(u => u.id === profile.id ? { ...u, photoURL: finalUrl } : u);
          } else {
            list.push({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              status: profile.status,
              createdAt: profile.createdAt,
              photoURL: finalUrl
            });
          }
        }
        localStorage.setItem("c_users_list", JSON.stringify(list));

        updateProfileState({ photoURL: finalUrl });
        setValue("photoURL", finalUrl);
      } else {
        // --- Modo Firebase Real ---
        if (!profile) return;
        
        // Caminho do arquivo: /users/{userId}/avatar_{timestamp}
        const storageRef = ref(storage, `users/${profile.id}/avatar_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(snapshot.ref);

        // Atualiza no Firestore imediatamente
        const userDocRef = doc(db, "users", profile.id);
        await updateDoc(userDocRef, { photoURL: finalUrl });
        
        updateProfileState({ photoURL: finalUrl });
        setValue("photoURL", finalUrl);
      }

      setSuccess("Foto de perfil carregada e atualizada com sucesso!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao fazer upload da imagem de perfil.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;
    setLoading(true);
    setSuccess(null);
    setError(null);

    const updatedData = {
      name: data.name,
      photoURL: data.photoURL || null,
    };

    try {
      if (isMock) {
        // --- Fluxo Mock ---
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const usersList = localStorage.getItem("c_users_list");
        let list: any[] = [];
        if (usersList) {
          list = JSON.parse(usersList) as any[];
        } else {
          list = [
            { id: "mock-admin-uid", name: "Dr. Pedro (Admin)", email: "admin@conecta.com", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100", role: "admin", status: "approved", createdAt: new Date().toISOString() },
            { id: "mock-teacher-uid", name: "Professor Marcelo (Instrutor)", email: "professor@conecta.com", photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100", role: "teacher", status: "approved", createdAt: new Date().toISOString() },
            { id: "mock-student-uid", name: "Guilherme Silva (Aluno)", email: "aluno@conecta.com", photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100", role: "student", status: "approved", createdAt: new Date().toISOString() }
          ];
        }

        const updatedList = list.map(u => {
          if (u.id === profile.id) {
            return { ...u, ...updatedData };
          }
          return u;
        });
        localStorage.setItem("c_users_list", JSON.stringify(updatedList));

        updateProfileState(updatedData);
      } else {
        // --- Fluxo Real Firebase Firestore ---
        const userDocRef = doc(db, "users", profile.id);
        await updateDoc(userDocRef, updatedData);
        updateProfileState(updatedData);
      }

      setSuccess("Perfil atualizado com sucesso!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador da Plataforma";
      case "teacher": return "Instrutor / Professor";
      default: return "Aluno";
    }
  };

  return (
    <DashboardLayout allowedRoles={["student", "teacher", "admin"]}>
      <div className="max-w-2xl mx-auto space-y-8 select-none animate-enter">
        
        {/* Cabeçalho */}
        <div className="border-b border-border pb-6">
          <h2 className="text-2xl font-black tracking-tight">Configurações de Perfil</h2>
          <p className="text-sm font-semibold text-muted-foreground">
            Altere seu nome de exibição, atualize sua foto de perfil ou gerencie dados da conta.
          </p>
        </div>

        {/* Alertas */}
        {success && (
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-2xl text-xs font-bold animate-pulse">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl text-xs font-bold animate-pulse">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Layout do Perfil (Card + Form) */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600" />

          {/* Coluna 1: Avatar preview */}
          <div className="flex flex-col items-center text-center space-y-4 md:col-span-1 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-8">
            <div 
              onClick={handleAvatarClick}
              className="relative h-28 w-28 rounded-full border-4 border-primary/25 overflow-hidden shadow-md cursor-pointer group transition-all hover:scale-105"
              title="Clique para escolher foto do computador"
            >
              <img
                src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name || "User")}`}
                alt={profile?.name}
                className="h-full w-full object-cover"
              />
              
              {/* Overlay de Hover com Design Moderno */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300">
                <ImageIcon className="h-5 w-5 mb-1" />
                <span className="text-[9px] font-black uppercase tracking-wider">Alterar Foto</span>
              </div>

              {/* Loader se estiver fazendo upload */}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Input oculto para carregar arquivo do computador */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="space-y-2.5 w-full">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={avatarUploading}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center justify-center space-x-1.5 mx-auto py-1 px-3.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all disabled:opacity-50"
              >
                <span>Escolher do Computador</span>
              </button>
              
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm truncate max-w-[150px] mx-auto">{profile?.name}</h4>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider w-max mx-auto block">
                  {profile ? getRoleLabel(profile.role) : "Aluno"}
                </span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 space-y-5">
            
            {/* Campo E-mail (Leitura apenas por segurança) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Endereço de E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground/60" />
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-secondary/35 text-xs font-semibold text-muted-foreground focus:outline-none"
                  title="O e-mail da conta não pode ser alterado."
                />
              </div>
              <span className="text-[9px] font-bold text-muted-foreground leading-none">O e-mail é o identificador único e não pode ser modificado.</span>
            </div>

            {/* Campo Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Seu nome"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-background text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? "border-destructive focus:ring-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Campo URL Foto de Perfil (Atualizado via Upload ou URL Direta) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">URL Foto de Perfil</label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                <input
                  {...register("photoURL")}
                  type="text"
                  placeholder="Link público ou preenchido por upload"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-background text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.photoURL ? "border-destructive focus:ring-destructive" : "border-border"
                  }`}
                />
              </div>
              {errors.photoURL && (
                <p className="text-xs font-semibold text-destructive">{errors.photoURL.message}</p>
              )}
            </div>

            {/* Botão de Salvar */}
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
