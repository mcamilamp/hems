import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const isUser = token?.role === "user" || token?.role === "admin";
    const pathname = req.nextUrl.pathname;

    // Proteger rutas de admin - solo admins pueden acceder
    if (pathname.startsWith("/admin") && !isAdmin) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("message", "Solo administradores pueden acceder a esta sección");
      return NextResponse.redirect(loginUrl);
    }

    // Proteger rutas de usuario - usuarios autenticados pueden acceder
    if (pathname.startsWith("/user") && !isUser) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("message", "Debes iniciar sesión para acceder a esta sección");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Rutas públicas - no requieren autenticación
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Rutas protegidas requieren token
        if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/register",
  ],
};

