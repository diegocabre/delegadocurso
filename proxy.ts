import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("admin_auth");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  // 1. Verificamos si estamos en la ruta de administración
  if (pathname.startsWith("/admin")) {
    // 2. Si NO hay cookie o la contraseña no coincide:
    if (!authCookie || authCookie.value !== ADMIN_PASSWORD) {
      // Redirigir a la página de login si la autenticación falla
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Si el usuario ya está autenticado e intenta ir al login, lo redirigimos al admin
  if (pathname === "/login") {
    if (authCookie && authCookie.value === ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
