"use client";

import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  FolderTree, 
  Tv, 
  FileText, 
  DollarSign, 
  X, 
  Loader2, 
  ArrowUpRight,
  Upload,
  ArrowRight,
  ChevronRight,
  Play
} from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockDb, Course, Module, Lesson, Category } from "@/services/mockDb";
import { formatPrice, formatDuration } from "@/lib/utils";

export default function TeacherCoursesPage() {
  const { profile } = useAuth();
  
  // Banco e dados locais
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Modais de Curso (Add/Edit)
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Modais de Módulos & Aulas
  const [managerCourse, setManagerCourse] = useState<Course | null>(null);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<Module | null>(null);

  // Estados dos Formulários
  const [cTitle, setCTitle] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cLevel, setCLevel] = useState<"Iniciante" | "Intermediário" | "Avançado">("Iniciante");
  const [cCategory, setCCategory] = useState("");
  const [cThumbnail, setCThumbnail] = useState("");

  const [mTitle, setMTitle] = useState("");
  const [mOrder, setMOrder] = useState("1");

  const [lTitle, setLTitle] = useState("");
  const [lDesc, setLDesc] = useState("");
  const [lVideoUrl, setLVideoUrl] = useState("");
  const [lDuration, setLDuration] = useState("15");
  const [lOrder, setLOrder] = useState("1");

  // Estado de upload simulado / real
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Carrega todos os dados iniciais
  useEffect(() => {
    async function loadData() {
      if (!profile) return;
      const allC = await mockDb.getCourses();
      const myC = profile.role === "admin" ? allC : allC.filter(c => c.teacherId === profile.id);
      setCourses(myC);

      const cats = await mockDb.getCategories();
      setCategories(cats);
      if (cats.length > 0) setCCategory(cats[0].id);

      const mods = await mockDb.getModules();
      setModules(mods);

      const less = await mockDb.getLessons();
      setLessons(less);
    }
    loadData();
  }, [profile]);

  const reloadData = async () => {
    if (!profile) return;
    const allC = await mockDb.getCourses();
    setCourses(profile.role === "admin" ? allC : allC.filter(c => c.teacherId === profile.id));
    setModules(await mockDb.getModules());
    setLessons(await mockDb.getLessons());
  };

  // --- CRUD CURSOS ---
  const handleOpenCourseAdd = () => {
    setEditingCourse(null);
    setCTitle("");
    setCDesc("");
    setCPrice("99.90");
    setCLevel("Iniciante");
    if (categories.length > 0) setCCategory(categories[0].id);
    setCThumbnail("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop");
    setCourseModalOpen(true);
  };

  const handleOpenCourseEdit = (course: Course) => {
    setEditingCourse(course);
    setCTitle(course.title);
    setCDesc(course.description);
    setCPrice(course.price.toString());
    setCLevel(course.level);
    setCCategory(course.categoryId);
    setCThumbnail(course.thumbnail);
    setCourseModalOpen(true);
  };

  const saveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const priceNum = parseFloat(cPrice) || 0;
    if (editingCourse) {
      // Edit
      await mockDb.updateCourse(editingCourse.id, {
        title: cTitle,
        description: cDesc,
        price: priceNum,
        level: cLevel,
        categoryId: cCategory,
        thumbnail: cThumbnail,
      });
    } else {
      // Add
      await mockDb.addCourse({
        title: cTitle,
        description: cDesc,
        price: priceNum,
        level: cLevel,
        categoryId: cCategory,
        thumbnail: cThumbnail,
        teacherId: profile.id,
        teacherName: profile.name,
        duration: 90, // Padrão inicial
        active: true
      });
    }
    setCourseModalOpen(false);
    reloadData();
  };

  const deleteCourse = async (id: string) => {
    if (confirm("Deseja mesmo excluir este curso? Esta ação é irreversível.")) {
      await mockDb.deleteCourse(id);
      reloadData();
    }
  };

  // --- CRUD MÓDULOS ---
  const handleOpenModuleAdd = () => {
    setEditingModule(null);
    setMTitle("");
    setMOrder((modules.filter(m => m.courseId === managerCourse?.id).length + 1).toString());
    setModuleModalOpen(true);
  };

  const handleOpenModuleEdit = (mod: Module) => {
    setEditingModule(mod);
    setMTitle(mod.title);
    setMOrder(mod.order.toString());
    setModuleModalOpen(true);
  };

  const saveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerCourse) return;

    const ord = parseInt(mOrder) || 1;
    if (editingModule) {
      await mockDb.updateModule(editingModule.id, { title: mTitle, order: ord });
    } else {
      await mockDb.addModule({
        courseId: managerCourse.id,
        title: mTitle,
        order: ord
      });
    }
    setModuleModalOpen(false);
    reloadData();
  };

  const deleteModule = async (id: string) => {
    if (confirm("Deseja mesmo excluir este módulo e todas as suas aulas?")) {
      await mockDb.deleteModule(id);
      // Remove aulas associadas no mock
      const associatedLessons = lessons.filter(l => l.moduleId === id);
      for (const l of associatedLessons) {
        await mockDb.deleteLesson(l.id);
      }
      reloadData();
    }
  };

  // --- CRUD AULAS (LESSONS) ---
  const handleOpenLessonAdd = (mod: Module) => {
    setSelectedModuleForLesson(mod);
    setEditingLesson(null);
    setLTitle("");
    setLDesc("");
    setLVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    setLDuration("15");
    setLOrder((lessons.filter(l => l.moduleId === mod.id).length + 1).toString());
    setLessonModalOpen(true);
  };

  const handleOpenLessonEdit = (lesson: Lesson, mod: Module) => {
    setSelectedModuleForLesson(mod);
    setEditingLesson(lesson);
    setLTitle(lesson.title);
    setLDesc(lesson.description);
    setLVideoUrl(lesson.videoUrl);
    setLDuration(lesson.duration.toString());
    setLOrder(lesson.order.toString());
    setLessonModalOpen(true);
  };

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleForLesson) return;

    const dur = parseInt(lDuration) || 15;
    const ord = parseInt(lOrder) || 1;

    if (editingLesson) {
      await mockDb.updateLesson(editingLesson.id, {
        title: lTitle,
        description: lDesc,
        videoUrl: lVideoUrl,
        duration: dur,
        order: ord
      });
    } else {
      await mockDb.addLesson({
        moduleId: selectedModuleForLesson.id,
        title: lTitle,
        description: lDesc,
        videoUrl: lVideoUrl,
        duration: dur,
        order: ord
      });
    }
    setLessonModalOpen(false);
    reloadData();
  };

  const deleteLesson = async (id: string) => {
    if (confirm("Deseja excluir esta aula?")) {
      await mockDb.deleteLesson(id);
      reloadData();
    }
  };

  // --- SIMULAÇÃO DE UPLOAD ---
  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Coloca um vídeo mock do Firebase Storage
          setLVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4");
          alert("Vídeo carregado com sucesso no Storage de Demonstração!");
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  return (
    <DashboardLayout allowedRoles={["teacher", "admin"]}>
      <div className="space-y-8 select-none w-full relative">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Meus Cursos Publicados</h2>
            <p className="text-sm font-semibold text-muted-foreground">
              Cadastre novos cursos, altere preços, crie ementas dinâmicas de módulos e anexe mídias nos formatos suportados.
            </p>
          </div>
          <button
            onClick={handleOpenCourseAdd}
            className="flex items-center justify-center space-x-1.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-xs shadow-md shadow-primary/10 hover:opacity-90 transition-all w-max cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Adicionar Novo Curso</span>
          </button>
        </div>

        {/* LISTAGEM DE CURSOS */}
        {courses.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground/60 animate-pulse" />
            <h3 className="font-extrabold text-lg">Você não possui cursos cadastrados</h3>
            <p className="text-sm text-muted-foreground font-semibold max-w-sm">
              Comece agora mesmo a compartilhar seu conhecimento clicando no botão no topo direito.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter">
            {courses.map((course) => (
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

                {/* Info do Curso */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {categories.find(c => c.id === course.categoryId)?.name || "Categoria"}
                    </span>
                    <h3 className="font-extrabold text-base leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="text-lg font-black text-primary">{formatPrice(course.price)}</span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {modules.filter(m => m.courseId === course.id).length} Módulos
                    </span>
                  </div>

                  {/* Ações CRUD do Curso */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setManagerCourse(course)}
                      className="flex items-center justify-center space-x-1 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary text-[10px] font-bold transition-all border border-border cursor-pointer"
                      title="Gerenciar Ementa"
                    >
                      <FolderTree className="h-3.5 w-3.5" />
                      <span>Ementa</span>
                    </button>

                    <button
                      onClick={() => handleOpenCourseEdit(course)}
                      className="flex items-center justify-center space-x-1 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-indigo-500/10 hover:text-indigo-500 text-[10px] font-bold transition-all border border-border cursor-pointer"
                      title="Editar Detalhes"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="flex items-center justify-center space-x-1 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white text-[10px] font-bold transition-all border border-destructive/20 cursor-pointer"
                      title="Excluir Curso"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL 1: FORMULÁRIO DO CURSO (ADD/EDIT) */}
        {courseModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-enter">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-xl space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setCourseModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-secondary text-muted-foreground border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg">
                  {editingCourse ? "Editar Curso" : "Criar Novo Curso"}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  Forneça as informações principais para listar seu curso na vitrine pública.
                </p>
              </div>

              <form onSubmit={saveCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Título do Curso</label>
                    <input
                      type="text"
                      required
                      value={cTitle}
                      onChange={(e) => setCTitle(e.target.value)}
                      placeholder="Ex: Next.js Completo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Descrição Completa</label>
                    <textarea
                      required
                      rows={3}
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                      placeholder="Sobre o que é este curso?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Preço (BRL)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={cPrice}
                        onChange={(e) => setCPrice(e.target.value)}
                        placeholder="199.90"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Nível de Dificuldade</label>
                    <select
                      value={cLevel}
                      onChange={(e: any) => setCLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Categoria</label>
                    <select
                      value={cCategory}
                      onChange={(e) => setCCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">URL da Thumbnail</label>
                    <input
                      type="text"
                      required
                      value={cThumbnail}
                      onChange={(e) => setCThumbnail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCourseModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold bg-secondary rounded-xl hover:bg-secondary/80 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow shadow-primary/20 hover:opacity-90 cursor-pointer"
                  >
                    Salvar Curso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PAINEL DE EMENTA / MÓDULOS & AULAS SPLIT-VIEW */}
        {managerCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-enter">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-5xl h-[85vh] flex flex-col justify-between shadow-2xl relative">
              <button 
                onClick={() => setManagerCourse(null)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-secondary text-muted-foreground border border-border cursor-pointer z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Titulo do Gestor */}
              <div className="border-b border-border pb-4 pr-10 shrink-0">
                <div className="flex items-center space-x-2 text-primary text-xs font-bold mb-1">
                  <FolderTree className="h-4 w-4" />
                  <span>Estrutura Ementa EAD</span>
                </div>
                <h3 className="font-extrabold text-lg truncate">
                  Gerenciar Módulos e Aulas: <span className="text-primary">{managerCourse.title}</span>
                </h3>
              </div>

              {/* Corpo Principal Rolo de Scroll */}
              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-muted-foreground uppercase tracking-wide">Módulos Cadastrados</h4>
                  <button
                    onClick={handleOpenModuleAdd}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-bold cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Novo Módulo</span>
                  </button>
                </div>

                {modules.filter(m => m.courseId === managerCourse.id).length === 0 ? (
                  <div className="p-12 text-center text-xs font-semibold text-muted-foreground border border-dashed border-border rounded-2xl">
                    Nenhum módulo cadastrado neste curso ainda. Crie um módulo para começar a adicionar aulas.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {modules
                      .filter(m => m.courseId === managerCourse.id)
                      .sort((a, b) => a.order - b.order)
                      .map((mod) => {
                        const associatedLessons = lessons.filter(l => l.moduleId === mod.id).sort((a, b) => a.order - b.order);
                        return (
                          <div 
                            key={mod.id} 
                            className="border border-border bg-background rounded-2xl p-5 space-y-4 shadow-sm"
                          >
                            {/* Módulo Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                              <div className="flex items-center space-x-2.5">
                                <span className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                  {mod.order}
                                </span>
                                <h5 className="font-black text-sm">{mod.title}</h5>
                              </div>
                              
                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  onClick={() => handleOpenLessonAdd(mod)}
                                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary text-[10px] font-bold transition-all border border-border cursor-pointer"
                                >
                                  <PlusCircle className="h-3.5 w-3.5" />
                                  <span>Add Aula</span>
                                </button>
                                <button
                                  onClick={() => handleOpenModuleEdit(mod)}
                                  className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-500 border border-border hover:border-indigo-500/20 cursor-pointer"
                                  title="Editar Módulo"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteModule(mod.id)}
                                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive border border-border hover:border-destructive/20 cursor-pointer"
                                  title="Excluir Módulo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Aulas do Módulo */}
                            <div className="space-y-2">
                              {associatedLessons.length === 0 ? (
                                <div className="text-center py-4 text-[11px] font-semibold text-muted-foreground border border-dashed border-border/40 rounded-xl">
                                  Nenhuma aula cadastrada neste módulo.
                                </div>
                              ) : (
                                associatedLessons.map((les) => (
                                  <div 
                                    key={les.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all text-xs font-semibold group"
                                  >
                                    <div className="flex items-center space-x-3 pr-4">
                                      <Play className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                      <span className="text-muted-foreground font-bold shrink-0">{les.order}.</span>
                                      <span className="text-foreground line-clamp-1">{les.title}</span>
                                      <span className="text-[10px] text-muted-foreground shrink-0 font-medium hidden sm:inline">
                                        ({formatDuration(les.duration)})
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleOpenLessonEdit(les, mod)}
                                        className="p-1 rounded-lg hover:bg-indigo-500/10 text-indigo-500 cursor-pointer"
                                        title="Editar Aula"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => deleteLesson(les.id)}
                                        className="p-1 rounded-lg hover:bg-destructive/10 text-destructive cursor-pointer"
                                        title="Excluir Aula"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Rodapé do Gestor */}
              <div className="border-t border-border pt-4 flex justify-end shrink-0">
                <button
                  onClick={() => setManagerCourse(null)}
                  className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 font-extrabold text-xs cursor-pointer shadow-sm"
                >
                  Fechar Ementa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CRIAR/EDITAR MÓDULO */}
        {moduleModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-enter">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setModuleModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-secondary text-muted-foreground border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg">
                  {editingModule ? "Editar Módulo" : "Adicionar Novo Módulo"}
                </h3>
              </div>

              <form onSubmit={saveModule} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Título do Módulo</label>
                  <input
                    type="text"
                    required
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Ex: Introdução ao Framework"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Ordem de Exibição</label>
                  <input
                    type="number"
                    required
                    value={mOrder}
                    onChange={(e) => setMOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModuleModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold bg-secondary rounded-xl hover:bg-secondary/80 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow shadow-primary/20 hover:opacity-90 cursor-pointer"
                  >
                    Salvar Módulo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CRIAR/EDITAR AULA (LESSON) */}
        {lessonModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-enter">
            <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg space-y-6 shadow-2xl relative">
              <button 
                onClick={() => setLessonModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full hover:bg-secondary text-muted-foreground border border-border cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-lg">
                  {editingLesson ? "Editar Aula" : "Adicionar Nova Aula"}
                </h3>
                {selectedModuleForLesson && (
                  <p className="text-xs text-muted-foreground font-semibold">
                    Criando aula no módulo: <span className="text-primary font-bold">{selectedModuleForLesson.title}</span>
                  </p>
                )}
              </div>

              <form onSubmit={saveLesson} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Título da Aula</label>
                    <input
                      type="text"
                      required
                      value={lTitle}
                      onChange={(e) => setLTitle(e.target.value)}
                      placeholder="Ex: Instalação e Estrutura Inicial"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Descrição da Aula</label>
                    <textarea
                      rows={2}
                      value={lDesc}
                      onChange={(e) => setLDesc(e.target.value)}
                      placeholder="O que os alunos vão aprender nesta aula?"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Duração (Minutos)</label>
                    <input
                      type="number"
                      required
                      value={lDuration}
                      onChange={(e) => setLDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Ordem no Módulo</label>
                    <input
                      type="number"
                      required
                      value={lOrder}
                      onChange={(e) => setLOrder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Campo de Mídia/Vídeo com suporte a simulador de upload no Storage */}
                  <div className="space-y-1.5 sm:col-span-2 border border-border bg-secondary/20 p-4 rounded-2xl flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground uppercase flex items-center space-x-1.5">
                        <Upload className="h-4 w-4 text-primary" />
                        <span>Mídia do Vídeo (Firebase Storage)</span>
                      </label>
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={simulateUpload}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 text-[10px] font-bold cursor-pointer transition-all"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                            <span>Subindo... {uploadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-3 w-3 shrink-0" />
                            <span>Simular Upload</span>
                          </>
                        )}
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      value={lVideoUrl}
                      onChange={(e) => setLVideoUrl(e.target.value)}
                      placeholder="URL do arquivo de vídeo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {/* Barra de Progresso Real/Simulada */}
                    {uploading && (
                      <div className="w-full bg-border rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setLessonModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold bg-secondary rounded-xl hover:bg-secondary/80 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl shadow shadow-primary/20 hover:opacity-90 cursor-pointer"
                  >
                    Salvar Aula
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
