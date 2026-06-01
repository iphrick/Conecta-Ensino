import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = request.cookies.get("conecta-session")?.value;
  const role = request.cookies.get("conecta-role")?.value;
  const status = request.cookies.get("conecta-status")?.value;

  const isAuthenticated = session === "active" && !!role && !!status;

  // 1. Tratamento para rotas de Autenticação (Login, Cadastro)
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isAuthenticated) {
      if (status === "pending") {
        return NextResponse.redirect(new URL("/dashboard/pending", request.url));
      }
      // Redireciona usuários já logados e ativos para suas respectivas dashboards
      if (role === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      } else if (role === "teacher") {
        return NextResponse.redirect(new URL("/dashboard/teacher", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/student", request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Proteção Geral para Qualquer Rota de Dashboard (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login?redirect=" + pathname, request.url));
    }

    // Se o usuário está pendente de aprovação, ele SÓ pode acessar a holding page /dashboard/pending
    if (status === "pending") {
      if (pathname !== "/dashboard/pending") {
        return NextResponse.redirect(new URL("/dashboard/pending", request.url));
      }
      return NextResponse.next();
    }

    // Se o usuário está aprovado mas tenta entrar na holding page, manda de volta pro dashboard correto
    if (status === "approved" && pathname === "/dashboard/pending") {
      if (role === "admin") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      if (role === "teacher") return NextResponse.redirect(new URL("/dashboard/teacher", request.url));
      return NextResponse.redirect(new URL("/dashboard/student", request.url));
    }
  }

  // 3. Proteção para a rota de Dashboard Administrativa
  if (pathname.startsWith("/dashboard/admin")) {
    if (role !== "admin") {
      const target = role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // 4. Proteção para a rota de Dashboard do Professor
  if (pathname.startsWith("/dashboard/teacher")) {
    if (role !== "teacher" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/student", request.url));
    }
  }

  return NextResponse.next();
}

// Configura em quais caminhos o Middleware deve ser disparado
export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
  ],
};
