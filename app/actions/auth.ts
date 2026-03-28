"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
      sameSite: "strict",
    });
    
    redirect("/admin");
  } else {
    return { error: "Clave incorrecta" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/");
}
