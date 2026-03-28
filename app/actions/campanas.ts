"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Función auxiliar para verificar la sesión
async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!authCookie || authCookie.value !== ADMIN_PASSWORD) {
    throw new Error("No autorizado");
  }
}

export async function crearCampana(formData: FormData) {
  await checkAuth();

  const nombre = formData.get("nombre") as string;
  const montoObjetivo = parseInt(formData.get("monto_objetivo") as string);

  const { error } = await supabaseAdmin.from("campanas").insert([
    {
      nombre,
      monto_objetivo: montoObjetivo,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function crearPagoCampana(formData: FormData) {
  await checkAuth();

  const alumnoId = formData.get("alumno_id") as string;
  const campanaId = formData.get("campana_id") as string;
  const monto = parseInt(formData.get("monto") as string);
  const fechaStr = formData.get("fecha") as string;
  const file = formData.get("comprobante") as File;

  let comprobanteUrl = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const fileName = `campana_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("boletas")
      .upload(`campanas/${fileName}`, file);

    if (uploadError) throw new Error("Error subiendo archivo: " + uploadError.message);
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("boletas").getPublicUrl(`campanas/${fileName}`);
    comprobanteUrl = publicUrl;
  }

  const { error } = await supabaseAdmin.from("pagos_campanas").insert([
    {
      alumno_id: alumnoId,
      campana_id: campanaId,
      monto,
      fecha: fechaStr,
      comprobante_url: comprobanteUrl,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function eliminarCampana(id: string) {
  await checkAuth();
  const { error } = await supabaseAdmin.from("campanas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function eliminarPagoCampana(id: string) {
  await checkAuth();
  const { error } = await supabaseAdmin.from("pagos_campanas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin");
}
