import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("admin_auth");

  // Protegemos /admin pero permitimos que el API de auth funcione
  if (pathname.startsWith("/admin")) {
    // Si la cookie es correcta, dejamos pasar
    if (authCookie?.value === process.env.ADMIN_PASSWORD) {
      return NextResponse.next();
    }

    // NOTA: No redirijas aquí si quieres manejar el formulario
    // dentro de la misma página /admin como tienes en tu código.
    // Si quieres usar tu formulario actual, el middleware NO debe redirigir.
  }

  return NextResponse.next();
}
