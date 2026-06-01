"use client";

// Definições de Interfaces
export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  categoryId: string;
  teacherId: string;
  teacherName: string;
  price: number;
  level: "Iniciante" | "Intermediário" | "Avançado";
  duration: number; // em minutos
  active: boolean;
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // em minutos
  order: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  progress: number; // 0 a 100
  completedLessons: string[]; // Lista de IDs de aulas concluídas
  enrolledAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  verificationCode: string;
  issuedAt: string;
}

// Sementes Iniciais de Dados (Seeds)
const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Programação", description: "Desenvolvimento Web, Mobile, Frontend, Backend e DevOps.", active: true, createdAt: new Date().toISOString() },
  { id: "cat-2", name: "Design & UX", description: "Criação de interfaces digitais, Figma, Prototipação e Design Thinking.", active: true, createdAt: new Date().toISOString() },
  { id: "cat-3", name: "Negócios & SaaS", description: "Empreendedorismo digital, Vendas, Lançamentos e Gestão de Produtos.", active: true, createdAt: new Date().toISOString() }
];

const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Desenvolvimento Web com Next.js 15 e React 19",
    description: "Domine a biblioteca mais popular de JavaScript em conjunto com o framework que está revolucionando a web. Aprenda roteamento com App Router, Renderização Síncrona, Server Actions, Otimizações Avançadas de Performance e integre com Firebase de ponta a ponta na criação de projetos robustos de nível de mercado.",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    categoryId: "cat-1",
    teacherId: "mock-teacher-uid",
    teacherName: "Professor Marcelo (Instrutor)",
    price: 189.90,
    level: "Intermediário",
    duration: 105,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "course-2",
    title: "UI/UX Design Profissional com Figma",
    description: "Aprenda a criar interfaces elegantes, intuitivas e que de fato convertem usuários. Entenda conceitos de Grid, Hierarquia Visual, Tipografia Harmoniosa, Componentização com Variants, Auto-Layout e Protótipos Interativos Prontos para Testes com Clientes Reais.",
    thumbnail: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=800&auto=format&fit=crop",
    categoryId: "cat-2",
    teacherId: "mock-teacher-uid",
    teacherName: "Professor Marcelo (Instrutor)",
    price: 129.00,
    level: "Iniciante",
    duration: 80,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "course-3",
    title: "Firebase para Apps Web e Mobile de Alto Impacto",
    description: "Construa o backend dos seus sonhos em tempo recorde sem precisar escrever código de infraestrutura de servidor. Domine regras de segurança do Firestore Database, Authentication por e-mail e social, Storage de mídias, Cloud Functions escaláveis e Hosting completo na Vercel.",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    categoryId: "cat-1",
    teacherId: "mock-admin-uid",
    teacherName: "Dr. Pedro (Admin)",
    price: 199.90,
    level: "Avançado",
    duration: 120,
    active: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_MODULES: Module[] = [
  // Módulos do Curso 1 (Next.js)
  { id: "mod-1", courseId: "course-1", title: "Módulo 1: Fundamentos do React 19 & Next.js 15", order: 1 },
  { id: "mod-2", courseId: "course-1", title: "Módulo 2: O Novo App Router e Roteamento Dinâmico", order: 2 },
  { id: "mod-3", courseId: "course-1", title: "Módulo 3: Conexão com Firestore e Server Actions", order: 3 },
  // Módulos do Curso 2 (Figma)
  { id: "mod-4", courseId: "course-2", title: "Módulo 1: Primeiros Passos no Figma", order: 1 },
  { id: "mod-5", courseId: "course-2", title: "Módulo 2: Cores, Grades e Tipografia", order: 2 },
  // Módulos do Curso 3 (Firebase)
  { id: "mod-6", courseId: "course-3", title: "Módulo 1: Setup e Autenticação de Usuários", order: 1 },
  { id: "mod-7", courseId: "course-3", title: "Módulo 2: Firestore Database em Ação", order: 2 }
];

const INITIAL_LESSONS: Lesson[] = [
  // Aulas Next.js (Módulo 1)
  { id: "les-1", moduleId: "mod-1", title: "1. Introdução ao Curso e Arquitetura do EAD", description: "Damos as boas-vindas ao curso. Conheça as tecnologias centrais e nossa metodologia.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", duration: 15, order: 1 },
  { id: "les-2", moduleId: "mod-1", title: "2. Novidades do React 19: Server Actions e Hooks", description: "Visão detalhada sobre hooks como useActionState, useOptimistic e compilador React.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", duration: 25, order: 2 },
  // Aulas Next.js (Módulo 2)
  { id: "les-3", moduleId: "mod-2", title: "1. O que muda no App Router?", description: "Comparação direta do Pages Router vs App Router e explicação de Layouts aninhados.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", duration: 30, order: 1 },
  { id: "les-4", moduleId: "mod-2", title: "2. Páginas de Erro e Loading States", description: "Configuração nativa de templates de fallback error.tsx e loading.tsx.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", duration: 15, order: 2 },
  // Aulas Next.js (Módulo 3)
  { id: "les-5", moduleId: "mod-3", title: "1. Server Actions com Banco Firestore", description: "Como submeter dados diretamente ao Firebase no lado do servidor sem APIs manuais.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", duration: 20, order: 1 },

  // Aulas Figma (Módulo 1)
  { id: "les-6", moduleId: "mod-4", title: "1. Tour Pela Interface do Figma", description: "Configuração de conta, ferramentas básicas, réguas e atalhos vitais.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", duration: 40, order: 1 },
  { id: "les-7", moduleId: "mod-4", title: "2. Frames, Shapes e Grupos", description: "Utilizando layouts primários e organizando o escopo de camadas.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", duration: 40, order: 2 },

  // Aulas Firebase (Módulo 1)
  { id: "les-8", moduleId: "mod-6", title: "1. Integrando Firebase no Next.js", description: "Configuração de chaves e inicialização do cliente em conexões seguras.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", duration: 60, order: 1 },
  { id: "les-9", moduleId: "mod-6", title: "2. Login por E-mail e Provedores Sociais", description: "Autenticação clássica e integração de popups OAuth.", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", duration: 60, order: 2 }
];

// Helper para ler/gravar localstorage com fallback seguro SSR
const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(stored) as T;
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Gerenciador do Banco Mock Offline
export const mockDb = {
  // --- CATEGORIAS ---
  getCategories: async (): Promise<Category[]> => {
    return getLocalStorageItem<Category[]>("c_categories", INITIAL_CATEGORIES);
  },
  saveCategories: (categories: Category[]): void => {
    setLocalStorageItem("c_categories", categories);
  },
  addCategory: async (category: Omit<Category, "id" | "createdAt">): Promise<Category> => {
    const list = await mockDb.getCategories();
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    list.push(newCat);
    mockDb.saveCategories(list);
    return newCat;
  },
  updateCategory: async (id: string, updated: Partial<Category>): Promise<Category> => {
    const list = await mockDb.getCategories();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Categoria não encontrada");
    list[idx] = { ...list[idx], ...updated };
    mockDb.saveCategories(list);
    return list[idx];
  },
  deleteCategory: async (id: string): Promise<void> => {
    const list = await mockDb.getCategories();
    const filtered = list.filter(c => c.id !== id);
    mockDb.saveCategories(filtered);
  },

  // --- CURSOS ---
  getCourses: async (): Promise<Course[]> => {
    return getLocalStorageItem<Course[]>("c_courses", INITIAL_COURSES);
  },
  saveCourses: (courses: Course[]): void => {
    setLocalStorageItem("c_courses", courses);
  },
  getCourseById: async (id: string): Promise<Course | null> => {
    const courses = await mockDb.getCourses();
    return courses.find(c => c.id === id && c.active) || null;
  },
  addCourse: async (course: Omit<Course, "id" | "createdAt">): Promise<Course> => {
    const list = await mockDb.getCourses();
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    list.push(newCourse);
    mockDb.saveCourses(list);
    return newCourse;
  },
  updateCourse: async (id: string, updated: Partial<Course>): Promise<Course> => {
    const list = await mockDb.getCourses();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Curso não encontrado");
    list[idx] = { ...list[idx], ...updated };
    mockDb.saveCourses(list);
    return list[idx];
  },
  deleteCourse: async (id: string): Promise<void> => {
    const list = await mockDb.getCourses();
    const filtered = list.filter(c => c.id !== id);
    mockDb.saveCourses(filtered);
  },

  // --- MÓDULOS ---
  getModules: async (): Promise<Module[]> => {
    return getLocalStorageItem<Module[]>("c_modules", INITIAL_MODULES);
  },
  saveModules: (modules: Module[]): void => {
    setLocalStorageItem("c_modules", modules);
  },
  getModulesByCourse: async (courseId: string): Promise<Module[]> => {
    const list = await mockDb.getModules();
    return list.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order);
  },
  addModule: async (module: Omit<Module, "id">): Promise<Module> => {
    const list = await mockDb.getModules();
    const newMod: Module = {
      ...module,
      id: `mod-${Date.now()}`
    };
    list.push(newMod);
    mockDb.saveModules(list);
    return newMod;
  },
  updateModule: async (id: string, updated: Partial<Module>): Promise<Module> => {
    const list = await mockDb.getModules();
    const idx = list.findIndex(m => m.id === id);
    if (idx === -1) throw new Error("Módulo não encontrado");
    list[idx] = { ...list[idx], ...updated };
    mockDb.saveModules(list);
    return list[idx];
  },
  deleteModule: async (id: string): Promise<void> => {
    const list = await mockDb.getModules();
    const filtered = list.filter(m => m.id !== id);
    mockDb.saveModules(filtered);
  },

  // --- AULAS (LESSONS) ---
  getLessons: async (): Promise<Lesson[]> => {
    return getLocalStorageItem<Lesson[]>("c_lessons", INITIAL_LESSONS);
  },
  saveLessons: (lessons: Lesson[]): void => {
    setLocalStorageItem("c_lessons", lessons);
  },
  getLessonsByModule: async (moduleId: string): Promise<Lesson[]> => {
    const list = await mockDb.getLessons();
    return list.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
  },
  addLesson: async (lesson: Omit<Lesson, "id">): Promise<Lesson> => {
    const list = await mockDb.getLessons();
    const newLesson: Lesson = {
      ...lesson,
      id: `les-${Date.now()}`
    };
    list.push(newLesson);
    mockDb.saveLessons(list);
    return newLesson;
  },
  updateLesson: async (id: string, updated: Partial<Lesson>): Promise<Lesson> => {
    const list = await mockDb.getLessons();
    const idx = list.findIndex(l => l.id === id);
    if (idx === -1) throw new Error("Aula não encontrada");
    list[idx] = { ...list[idx], ...updated };
    mockDb.saveLessons(list);
    return list[idx];
  },
  deleteLesson: async (id: string): Promise<void> => {
    const list = await mockDb.getLessons();
    const filtered = list.filter(l => l.id !== id);
    mockDb.saveLessons(filtered);
  },

  // --- MATRÍCULAS E PROGRESSO (ENROLLMENTS) ---
  getEnrollments: async (): Promise<Enrollment[]> => {
    return getLocalStorageItem<Enrollment[]>("c_enrollments", []);
  },
  saveEnrollments: (enrollments: Enrollment[]): void => {
    setLocalStorageItem("c_enrollments", enrollments);
  },
  getEnrollmentsByStudent: async (studentId: string): Promise<Enrollment[]> => {
    const list = await mockDb.getEnrollments();
    return list.filter(e => e.studentId === studentId);
  },
  getEnrollment: async (studentId: string, courseId: string): Promise<Enrollment | null> => {
    const list = await mockDb.getEnrollments();
    return list.find(e => e.studentId === studentId && e.courseId === courseId) || null;
  },
  enrollInCourse: async (studentId: string, courseId: string): Promise<Enrollment> => {
    const list = await mockDb.getEnrollments();
    const exists = list.find(e => e.studentId === studentId && e.courseId === courseId);
    if (exists) return exists;

    const newEnrollment: Enrollment = {
      id: `${studentId}_${courseId}`,
      studentId,
      courseId,
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newEnrollment);
    mockDb.saveEnrollments(list);
    return newEnrollment;
  },
  completeLesson: async (studentId: string, courseId: string, lessonId: string, isCompleted: boolean): Promise<Enrollment> => {
    const list = await mockDb.getEnrollments();
    const idx = list.findIndex(e => e.studentId === studentId && e.courseId === courseId);
    if (idx === -1) throw new Error("Matrícula não encontrada.");

    let completed = [...list[idx].completedLessons];
    if (isCompleted) {
      if (!completed.includes(lessonId)) completed.push(lessonId);
    } else {
      completed = completed.filter(id => id !== lessonId);
    }

    // Calcula o progresso real baseado nas aulas totais do curso
    // Precisamos achar todas as aulas do curso:
    const modules = await mockDb.getModulesByCourse(courseId);
    let totalLessonsCount = 0;
    for (const m of modules) {
      const lessons = await mockDb.getLessonsByModule(m.id);
      totalLessonsCount += lessons.length;
    }

    const progress = totalLessonsCount > 0 ? Math.round((completed.length / totalLessonsCount) * 100) : 0;

    list[idx] = {
      ...list[idx],
      completedLessons: completed,
      progress: Math.min(progress, 100),
      updatedAt: new Date().toISOString()
    };

    mockDb.saveEnrollments(list);

    // Se o progresso atingiu 100%, gera o certificado automaticamente!
    if (list[idx].progress === 100) {
      await mockDb.generateCertificate(studentId, courseId);
    }

    return list[idx];
  },

  // --- CERTIFICADOS ---
  getCertificates: async (): Promise<Certificate[]> => {
    return getLocalStorageItem<Certificate[]>("c_certificates", []);
  },
  saveCertificates: (certs: Certificate[]): void => {
    setLocalStorageItem("c_certificates", certs);
  },
  getCertificatesByStudent: async (studentId: string): Promise<Certificate[]> => {
    const list = await mockDb.getCertificates();
    return list.filter(c => c.studentId === studentId);
  },
  getCertificateByCode: async (code: string): Promise<Certificate | null> => {
    const list = await mockDb.getCertificates();
    return list.find(c => c.verificationCode.toUpperCase() === code.toUpperCase()) || null;
  },
  generateCertificate: async (studentId: string, courseId: string): Promise<Certificate> => {
    const certs = await mockDb.getCertificates();
    const exists = certs.find(c => c.studentId === studentId && c.courseId === courseId);
    if (exists) return exists;

    // Busca dados do aluno
    const storedProfile = localStorage.getItem("conecta_mock_profile");
    const studentName = storedProfile ? (JSON.parse(storedProfile) as any).name : "Aluno Integrado";

    // Busca dados do curso
    const course = await mockDb.getCourseById(courseId);
    const courseTitle = course ? course.title : "Curso Conecta Ensino";

    // Código de validação curto
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let verificationCode = "";
    for (let i = 0; i < 8; i++) {
      verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      studentId,
      studentName,
      courseId,
      courseTitle,
      verificationCode,
      issuedAt: new Date().toISOString()
    };

    certs.push(newCert);
    mockDb.saveCertificates(certs);
    return newCert;
  }
};
export default mockDb;
