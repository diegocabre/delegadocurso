import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("admin_auth");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  // 1. Verificamos si estamos en la ruta de administración
  if (pathname.startsWith("/admin")) {
    // 2. Si NO hay cookie o la contraseña no coincide:
    // Solo dejamos pasar si la ruta es el "login" (si tuvieras una separada)
    // Pero como lo manejas en el mismo componente /admin, solo validamos la cookie.
    if (!authCookie || authCookie.value !== ADMIN_PASSWORD) {
      // Opcional: Podrías redirigir a una página de error o simplemente dejar que
      // el componente de React maneje el estado "no autenticado" como lo haces ahora.
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// 3. Mejoramos el 'matcher' para que el middleware no corra en archivos estáticos
// Esto optimiza el rendimiento y evita avisos innecesarios.
export const config = {
  matcher: ["/admin/:path*"],
};
