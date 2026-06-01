"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Award, 
  Download, 
  ExternalLink, 
  Printer, 
  Calendar,
  X,
  Sparkles,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Certificate } from "@/services/mockDb";

export default function StudentCertificatesPage() {
  const { profile } = useAuth();
  
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    async function loadCertificates() {
      if (!profile) return;
      const list = await mockDb.getCertificatesByStudent(profile.id);
      setCertificates(list);
    }
    loadCertificates();
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout allowedRoles={["student", "teacher", "admin"]}>
      <div className="space-y-8 select-none w-full print:hidden">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-amber-500 shrink-0" />
              <span>Minhas Conquistas</span>
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Visualize seus certificados emitidos automaticamente após concluir 100% das aulas de um curso.
            </p>
          </div>
        </div>

        {/* Listagem */}
        {certificates.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
            <Award className="h-16 w-16 text-muted-foreground/60 animate-pulse" />
            <h3 className="font-extrabold text-lg">Nenhum certificado emitido</h3>
            <p className="text-sm text-muted-foreground font-semibold max-w-sm">
              Complete todas as aulas dos seus cursos matriculados para desbloquear seus certificados oficiais automaticamente.
            </p>
            <Link
              href="/dashboard/student"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow hover:opacity-90 transition-all cursor-pointer"
            >
              Ir para Meus Cursos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-enter">
            {certificates.map((cert) => (
              <div 
                key={cert.id}
                className="flex flex-col sm:flex-row items-center p-6 bg-card border border-border rounded-2xl hover:shadow-md transition-all gap-5 group"
              >
                {/* Visual Icon */}
                <div className="h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="h-9 w-9" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3.5 text-center sm:text-left min-w-0 w-full">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base leading-snug line-clamp-1">{cert.courseTitle}</h4>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center justify-center sm:justify-start space-x-1">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      <span>Emitido em {new Date(cert.issuedAt).toLocaleDateString("pt-BR")}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Cód: {cert.verificationCode}
                    </span>
                    <button
                      onClick={() => setViewingCertificate(cert)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary text-[10px] font-bold border border-border cursor-pointer transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Visualizar & Imprimir</span>
                    </button>
                    <Link
                      href={`/verify-certificate?code=${cert.verificationCode}`}
                      target="_blank"
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary text-[10px] font-bold border border-border transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Validar Link</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL / TELA DE IMPRESSÃO DO CERTIFICADO */}
      {viewingCertificate && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-50 animate-enter print:absolute print:inset-0 print:bg-white print:p-0">
          
          {/* Header do visualizador (invisível ao imprimir) */}
          <div className="w-full max-w-4xl flex items-center justify-between pb-4 text-white print:hidden">
            <span className="font-bold text-sm flex items-center space-x-1.5">
              <Award className="h-5 w-5 text-amber-500 shrink-0" />
              <span>Visualizador de Certificado Oficial</span>
            </span>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir / Baixar PDF</span>
              </button>
              <button
                onClick={() => setViewingCertificate(null)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* O CERTIFICADO EM SI (LAYOUT PAISAGEM / LANDSCAPE) */}
          <div className="w-full max-w-4xl aspect-[1.414/1] bg-white border-[16px] border-double border-indigo-950 p-12 text-black flex flex-col justify-between shadow-2xl relative select-none rounded-xl print:rounded-none print:border-[16px] print:shadow-none print:m-0 print:w-full print:h-full">
            {/* Elementos Vetoriais Decorativos de Fundo */}
            <div className="absolute top-0 right-0 h-48 w-48 rounded-bl-full bg-gradient-to-bl from-indigo-100/40 to-transparent -z-10" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-tr-full bg-gradient-to-tr from-violet-100/40 to-transparent -z-10" />

            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b-2 border-indigo-950/20 pb-4">
              <div className="flex items-center space-x-2 text-indigo-950">
                <GraduationCap className="h-8 w-8" />
                <span className="font-black text-lg tracking-wider">CONECTA ENSINO EAD</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-indigo-950 bg-indigo-100 px-3 py-1 rounded-full uppercase">
                  Certificado de Conclusão
                </span>
              </div>
            </div>

            {/* Corpo de Texto */}
            <div className="text-center space-y-6 my-auto">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Certificamos de forma oficial que</span>
              <h3 className="text-3xl sm:text-4xl font-black text-indigo-950 border-b border-indigo-950/10 pb-2 w-max mx-auto px-6">
                {viewingCertificate.studentName}
              </h3>
              <p className="text-sm sm:text-base font-semibold leading-relaxed max-w-xl mx-auto text-zinc-700">
                concluiu com êxito todas as aulas e atividades complementares do curso online de livre extensão universitária intitulado
              </p>
              <h4 className="text-xl sm:text-2xl font-black text-indigo-600">
                "{viewingCertificate.courseTitle}"
              </h4>
              <p className="text-xs font-bold text-zinc-500 uppercase">
                emitido em {new Date(viewingCertificate.issuedAt).toLocaleDateString("pt-BR")}
              </p>
            </div>

            {/* Assinaturas e Validação */}
            <div className="flex items-end justify-between pt-6 border-t border-indigo-950/20">
              <div className="text-left space-y-1">
                <div className="h-6 w-32 border-b border-zinc-400 mx-auto opacity-30" />
                <p className="text-[10px] font-extrabold text-indigo-950 uppercase">Direção Conecta Ensino</p>
                <p className="text-[9px] text-zinc-500 font-semibold">Assinatura Digital Valida</p>
              </div>

              {/* Verified Stamp badge */}
              <div className="flex flex-col items-center space-y-1">
                <div className="h-14 w-14 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center text-emerald-500 animate-pulse">
                  <CheckCircle2 className="h-8 w-8 fill-current" />
                </div>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Autêntico</span>
              </div>

              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-indigo-950">CÓDIGO DE AUTENTICIDADE</p>
                <p className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {viewingCertificate.verificationCode}
                </p>
                <p className="text-[8px] text-zinc-500 font-semibold">Validar em conectaensino.com/verify</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
