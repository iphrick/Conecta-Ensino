"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, BookOpen, Clock, ArrowRight, X, Grid, List } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { mockDb, Course, Category } from "@/services/mockDb";
import { formatPrice, formatDuration } from "@/lib/utils";

export default function CatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "price-asc" | "price-desc">("title");

  useEffect(() => {
    async function loadData() {
      const allCourses = await mockDb.getCourses();
      const allCategories = await mockDb.getCategories();
      setCourses(allCourses);
      setCategories(allCategories);
    }
    loadData();
  }, []);

  // Processa filtragem e ordenação no cliente
  const filteredCourses = courses
    .filter((course) => {
      // 1. Filtro ativo
      if (!course.active) return false;
      
      // 2. Filtro Busca Textual
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 3. Filtro Categoria
      const matchesCategory = selectedCategory === "all" || course.categoryId === selectedCategory;

      // 4. Filtro Nível
      const matchesLevel = selectedLevel === "all" || course.level.toLowerCase() === selectedLevel.toLowerCase();

      return matchesSearch && matchesCategory && matchesLevel;
    })
    .sort((a, b) => {
      // Ordenação
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return a.title.localeCompare(b.title); // Padrão por Título
    });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("title");
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col space-y-8 select-none w-full">
        
        {/* Cabeçalho da Página */}
        <div className="flex flex-col space-y-4 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Catálogo de Cursos</h1>
          <p className="text-muted-foreground font-semibold text-sm sm:text-base">
            Encontre o curso perfeito para alavancar sua carreira. Use os filtros ao lado para refinar sua busca por temas e níveis.
          </p>
        </div>

        {/* Barra de Busca e Ordenação */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
          {/* Caixa de Busca */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, instrutor ou ementa..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 p-0.5 hover:bg-secondary text-muted-foreground rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Ordenador e Visualizador */}
          <div className="flex w-full lg:w-auto items-center justify-between sm:justify-end gap-4 shrink-0">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-border bg-background text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
              >
                <option value="title">Ordem Alfabética</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout do Catálogo (Filtros Laterais + Grid de Cursos) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Filtros Laterais */}
          <aside className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="font-extrabold text-sm flex items-center space-x-2">
                <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
                <span>Filtros Rápidos</span>
              </span>
              {(selectedCategory !== "all" || selectedLevel !== "all" || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-destructive hover:underline cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filtro de Categorias */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Categorias</h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`text-left text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todas as Categorias
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Dificuldade */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nível de Dificuldade</h3>
              <div className="flex flex-col space-y-2">
                {["all", "iniciante", "intermediário", "avançado"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`text-left text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer capitalize ${
                      selectedLevel === lvl
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl === "all" ? "Todos os Níveis" : lvl}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Lista de Cursos Encontrados */}
          <div className="lg:col-span-3">
            {filteredCourses.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <BookOpen className="h-16 w-16 text-muted-foreground/60 animate-pulse" />
                <h3 className="font-extrabold text-lg">Nenhum curso encontrado</h3>
                <p className="text-sm text-muted-foreground font-semibold max-w-sm">
                  Não encontramos cursos que coincidam com seus termos de busca ou filtros selecionados. Tente alterar os critérios.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer shadow-md hover:opacity-90 transition-all"
                >
                  Redefinir Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-44 w-full overflow-hidden shrink-0">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {course.level}
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {categories.find(c => c.id === course.categoryId)?.name || "Categoria"}
                        </span>
                        <h3 className="font-extrabold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                          {course.description}
                        </p>
                      </div>

                      {/* Info de rodapé */}
                      <div className="flex flex-col space-y-3 pt-3 border-t border-border/60">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-primary shrink-0" />
                            <span>{formatDuration(course.duration)}</span>
                          </span>
                          <span className="text-xs text-foreground font-extrabold truncate max-w-[130px]">
                            {course.teacherName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-primary">{formatPrice(course.price)}</span>
                          <Link
                            href={`/courses/${course.id}`}
                            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground font-bold text-[11px] shadow-sm transition-all"
                          >
                            <span>Ementa</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </PublicLayout>
  );
}
