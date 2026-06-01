"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Star, 
  Tv, 
  Trophy, 
  Users, 
  FileText,
  ChevronDown,
  ChevronUp,
  Bookmark
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { mockDb, Course, Category } from "@/services/mockDb";
import { formatPrice } from "@/lib/utils";

// FAQs Data
const FAQ_ITEMS = [
  {
    q: "Como funcionam os certificados da plataforma?",
    a: "Assim que você atingir 100% de conclusão nas aulas de qualquer curso matriculado, nosso sistema gerará um certificado PDF exclusivo contendo um código de verificação curto. Qualquer pessoa ou recrutador pode validar a autenticidade do seu certificado na página pública de validação da Conecta Ensino."
  },
  {
    q: "Eu posso me cadastrar como instrutor e publicar meus próprios cursos?",
    a: "Sim! A Conecta Ensino é uma plataforma aberta para compartilhamento de conhecimento. Ao criar sua conta, basta selecionar a opção 'Instrutor'. Você terá acesso imediato a um painel administrativo para cadastrar cursos, organizar módulos por ordem de exibição, carregar vídeos de aulas e anexar PDFs complementares."
  },
  {
    q: "O acesso aos cursos comprados expira?",
    a: "Não. Todos os cursos nos quais você se matricular na Conecta Ensino possuem acesso vitalício. Você pode assistir às aulas no seu próprio ritmo, rever o conteúdo quantas vezes desejar e acompanhar novas atualizações adicionadas pelos instrutores."
  },
  {
    q: "Quais são os requisitos técnicos para assistir às aulas?",
    a: "Nossa plataforma foi desenvolvida utilizando conceitos Mobile-First e layouts responsivos de alta fidelidade. Você pode assistir às aulas perfeitamente em smartphones, tablets, notebooks ou computadores desktop. Tudo o que você precisa é de uma conexão estável com a internet para carregar os vídeos."
  }
];

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const allCourses = await mockDb.getCourses();
      const allCategories = await mockDb.getCategories();
      setCourses(allCourses.slice(0, 3)); // Pega os 3 primeiros para destaque
      setCategories(allCategories);
    }
    loadData();
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <PublicLayout>
      <div className="flex flex-col w-full select-none overflow-x-hidden">
        
        {/* 1. HERO SECTION */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-b from-indigo-950/20 via-background to-background border-b border-border">
          {/* Círculo luminoso de fundo */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl -z-10" />

          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texto do Hero */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary animate-pulse">
                <Sparkles className="h-4 w-4" />
                <span>Educação e Conectividade Sem Limites</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                Aprenda com Especialistas, Conecte-se com o{" "}
                <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Futuro
                </span>
              </h1>

              <p className="text-muted-foreground font-medium text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Uma plataforma moderna de ensino EAD inspirada nas gigantes do mercado. Publique seus próprios cursos ou assista a aulas de alta performance com player de vídeo integrado e emissão de certificados válidos.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  href="/courses"
                  className="flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xl shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all"
                >
                  <span>Explorar Cursos</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-card border border-border text-foreground hover:bg-secondary font-extrabold text-sm transition-all"
                >
                  <span>Quero Ser Professor</span>
                </Link>
              </div>

              {/* Estatísticas Rápidas do Hero */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60 max-w-md mx-auto lg:mx-0">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-black text-2xl sm:text-3xl text-primary">15k+</span>
                  <span className="text-xs font-semibold text-muted-foreground">Alunos Ativos</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-black text-2xl sm:text-3xl text-indigo-500">120+</span>
                  <span className="text-xs font-semibold text-muted-foreground">Cursos Online</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="font-black text-2xl sm:text-3xl text-violet-500">99.8%</span>
                  <span className="text-xs font-semibold text-muted-foreground">Satisfação</span>
                </div>
              </div>
            </div>

            {/* Imagem / Card Decorativo no Hero */}
            <div className="hidden lg:flex justify-center relative animate-enter">
              <div className="relative w-[500px] h-[380px] rounded-3xl overflow-hidden shadow-2xl border border-border bg-card p-4 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 to-indigo-600/10" />
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                  alt="Estudante online"
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-8 left-8 glass p-4 rounded-2xl flex items-center space-x-3 max-w-xs shadow-xl animate-bounce">
                  <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold">Certificação Inclusa</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold">Validação via hash pública</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. BENEFÍCIOS (BENEFITS) */}
        <section className="py-20 bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Por Que a Conecta?</h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Uma experiência de ensino inovadora</p>
              <p className="text-muted-foreground font-semibold text-sm sm:text-base">
                Desenvolvemos recursos focados no aprendizado fluido e no empoderamento dos instrutores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/40 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-5">
                  <Tv className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg mb-2">Player de Vídeo Fluido</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Player moderno para reprodução inteligente de aulas, marcação de concluídas e ementa lateral integrada.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/40 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-5">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg mb-2">Certificado Instantâneo</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Conclua as aulas e emita na hora seu certificado de conclusão em formato PDF com código hash de validação.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/40 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 mb-5">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg mb-2">Painel de Professor (CRUD)</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  CRUD completo de cursos, gerenciamento e ordenação de módulos, além de upload progressivo de vídeos e PDFs.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/40 hover:-translate-y-1 transition-all">
                <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-5">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg mb-2">Controle Geral de Admin</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Controle de usuários, mudança de roles, criação de categorias temáticas e relatórios de faturamento total.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CURSOS EM DESTAQUE (FEATURED COURSES) */}
        <section className="py-20 bg-background border-b border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
              <div className="space-y-4 max-w-xl">
                <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Nossas Vitrines</h2>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Cursos em Destaque</p>
                <p className="text-muted-foreground font-semibold text-sm sm:text-base">
                  Aprenda com metodologia passo a passo, projetos práticos e suporte direto com instrutores.
                </p>
              </div>
              <Link
                href="/courses"
                className="flex items-center space-x-1 px-5 py-3 rounded-xl bg-secondary text-secondary-foreground hover:text-primary hover:bg-secondary/80 font-extrabold text-sm transition-all"
              >
                <span>Ver Todos</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 hover:scale-[1.01] transition-all group"
                >
                  {/* Thumbnail do Curso */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      {course.level}
                    </div>
                  </div>

                  {/* Detalhes Textuais */}
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {categories.find(c => c.id === course.categoryId)?.name || "Categoria"}
                      </span>
                      <h3 className="font-extrabold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    <div className="border-t border-border/60 pt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(course.teacherName)}`}
                          alt={course.teacherName}
                          className="h-6 w-6 rounded-full border border-primary"
                        />
                        <span className="text-xs font-semibold text-muted-foreground">{course.teacherName}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground font-bold">Investimento</span>
                        <span className="text-lg font-black text-primary">{formatPrice(course.price)}</span>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${course.id}`}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground font-bold text-xs shadow-sm transition-all text-center cursor-pointer"
                    >
                      <span>Visualizar Ementa</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. TESTIMONIALS (DEPOIMENTOS) */}
        <section className="py-20 bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Opinião de Quem Importa</h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">O que dizem nossos alunos</p>
              <p className="text-muted-foreground font-semibold text-sm sm:text-base">
                Confira os relatos reais de quem já concluiu cursos e emitiu certificados na plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testemunho 1 */}
              <div className="p-6 rounded-2xl bg-background border border-border flex flex-col justify-between space-y-6">
                <p className="text-sm font-semibold italic text-muted-foreground leading-relaxed">
                  "Concluí o curso de Next.js e achei a ementa super bem explicada. As aulas marcando o progresso automaticamente ajudam muito a focar. Em seguida, baixei meu PDF do certificado e já adicionei no LinkedIn. Excelente!"
                </p>
                <div className="flex items-center space-x-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                    alt="Ana Clara"
                    className="h-10 w-10 rounded-full border border-primary object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold">Ana Clara Souza</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">Estudante de Engenharia de Software</p>
                    <div className="flex text-amber-500 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testemunho 2 */}
              <div className="p-6 rounded-2xl bg-background border border-border flex flex-col justify-between space-y-6">
                <p className="text-sm font-semibold italic text-muted-foreground leading-relaxed">
                  "Cadastrei meu curso de UI/UX Figma como professor e o painel de criação de módulos e uploads do Storage é extremamente veloz. Fiquei muito surpreso com o carregamento rápido de vídeos. Recomendo para qualquer produtor de conteúdo."
                </p>
                <div className="flex items-center space-x-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
                    alt="Rodrigo Ramos"
                    className="h-10 w-10 rounded-full border border-primary object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold">Rodrigo Ramos</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">Designer de Interfaces / Instrutor</p>
                    <div className="flex text-amber-500 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testemunho 3 */}
              <div className="p-6 rounded-2xl bg-background border border-border flex flex-col justify-between space-y-6">
                <p className="text-sm font-semibold italic text-muted-foreground leading-relaxed">
                  "O site é lindo tanto em temas escuros quanto claros! A transição é muito rápida e o visual de vidro nas bordas dá uma sensação muito premium. Assistir no celular funciona de forma espetacular. Parabéns pela tecnologia."
                </p>
                <div className="flex items-center space-x-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
                    alt="Laura Mota"
                    className="h-10 w-10 rounded-full border border-primary object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold">Laura Mendes</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">Desenvolvedora Frontend Junior</p>
                    <div className="flex text-amber-500 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FAQ (PERGUNTAS FREQUENTES) */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Dúvidas Frequentes</h2>
              <p className="text-3xl font-extrabold tracking-tight">Perguntas Respondidas</p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-border bg-card rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-5 font-bold text-sm sm:text-base text-left hover:text-primary transition-colors cursor-pointer focus:outline-none"
                    >
                      <span>{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-muted-foreground font-medium leading-relaxed border-t border-border/40 animate-enter">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
