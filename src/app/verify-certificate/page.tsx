"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Calendar, 
  User, 
  BookOpen, 
  ShieldCheck,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { mockDb, Certificate } from "@/services/mockDb";

function VerifyForm() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const cert = await mockDb.getCertificateByCode(searchCode.trim());
      setCertificate(cert);
    } catch (err) {
      console.error(err);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(code);
  };

  return (
    <div className="w-full max-w-2xl space-y-8 text-center animate-enter">
      {/* Header */}
      <div className="space-y-3.5">
        <div className="inline-flex items-center space-x-2 text-primary">
          <Award className="h-10 w-10" />
          <span className="font-extrabold text-2xl tracking-wider">CONECTA VALIDAR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Validador de Certificados Oficial</h1>
        <p className="text-muted-foreground font-semibold text-sm sm:text-base max-w-md mx-auto">
          Insira o código de autenticidade alfanumérico curto do certificado para verificar sua legitimidade de registro em nosso banco NoSQL.
        </p>
      </div>

      {/* Form de Busca */}
      <form onSubmit={onSubmit} className="max-w-md mx-auto flex gap-3 bg-card border border-border p-2 rounded-2xl shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: AB3C6D8F"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-transparent border-0 text-sm font-black focus:outline-none uppercase tracking-widest text-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm cursor-pointer shadow hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Validando..." : "Validar"}
        </button>
      </form>

      {/* RESULTADO DA BUSCA */}
      {searched && !loading && (
        <div className="max-w-xl mx-auto animate-slide">
          {certificate ? (
            /* CASO ENCONTRADO (CERTIFICADO VERIFICADO) */
            <div className="bg-card border border-emerald-500/20 rounded-3xl p-8 shadow-xl relative overflow-hidden space-y-6">
              {/* Glowing border top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
              
              {/* Check badge */}
              <div className="mx-auto h-16 w-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 animate-pulse">
                <CheckCircle2 className="h-9 w-9 fill-current" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Autenticidade Confirmada</span>
                <h3 className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-white">Certificado Verificado com Sucesso</h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Este documento digital está registrado na Conecta Ensino e é válido nacionalmente em conformidade legal.
                </p>
              </div>

              {/* Informações detalhadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-border/80 py-5 text-left text-xs font-semibold">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] uppercase">🎓 Estudante Diplomado</span>
                  <p className="text-sm font-black flex items-center space-x-1.5">
                    <User className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>{certificate.studentName}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] uppercase">📅 Data de Conclusão</span>
                  <p className="text-sm font-black flex items-center space-x-1.5">
                    <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>{new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}</span>
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground text-[10px] uppercase">📖 Curso Concluído</span>
                  <p className="text-sm font-black flex items-center space-x-1.5">
                    <BookOpen className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>{certificate.courseTitle}</span>
                  </p>
                </div>
              </div>

              {/* Rodapé do badge verificado */}
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Assinado pela Diretoria</span>
                </span>
                <span className="text-primary font-black uppercase bg-primary/10 px-2 py-0.5 rounded">
                  Cód: {certificate.verificationCode}
                </span>
              </div>
            </div>
          ) : (
            /* CASO NÃO ENCONTRADO */
            <div className="bg-card border border-destructive/20 rounded-3xl p-8 shadow-xl relative overflow-hidden space-y-6">
              {/* Glowing border top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive" />
              
              {/* Warning badge */}
              <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                <AlertTriangle className="h-9 w-9" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-destructive uppercase tracking-widest block">Falha de Validação</span>
                <h3 className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-white">Código Não Encontrado</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto">
                  Não encontramos nenhum registro de certificado contendo o código <span className="text-destructive font-black uppercase bg-destructive/10 px-1.5 py-0.5 rounded">{code}</span>. Certifique-se de digitar corretamente.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para a página inicial</span>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center py-16 px-6 bg-gradient-to-b from-indigo-950/10 via-background to-background select-none w-full overflow-x-hidden">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-xs font-semibold text-muted-foreground animate-pulse">Carregando validador...</span>
          </div>
        }>
          <VerifyForm />
        </Suspense>
      </div>
    </PublicLayout>
  );
}
