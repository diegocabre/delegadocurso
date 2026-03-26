import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Solo protegemos la ruta /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const authCookie = request.cookies.get("admin_auth");

    // Si no tiene la cookie de autorización, lo mandamos al login de admin
    // OJO: Si tu página de login está dentro de /admin, esto causará un bucle.
    // Asumiremos que creas una ruta /login-admin separada o manejas el estado.

    // Para este ejemplo, usaremos una validación básica de Header o Cookie
    if (authCookie?.value !== process.env.ADMIN_PASSWORD) {
      // Si no está autorizado, puedes redirigir al home o a un 404
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configura en qué rutas se debe ejecutar el middleware
export const config = {
  matcher: "/admin/:path*",
};
