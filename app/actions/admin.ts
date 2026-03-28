"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Función auxiliar para verificar la sesión en el servidor
async function checkAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!authCookie || authCookie.value !== ADMIN_PASSWORD) {
    throw new Error("No autorizado");
  }
}

export async function crearGasto(formData: FormData) {
  await checkAuth();

  const monto = parseInt(formData.get("monto") as string);
  const descripcion = formData.get("descripcion") as string;
  const categoria = formData.get("categoria") as string;
  const fecha = formData.get("fecha") as string;
  const file = formData.get("boleta") as File;

  let boletaUrl = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const fileName = `gasto_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("boletas")
      .upload(`gastos/${fileName}`, file);

    if (uploadError) throw new Error(uploadError.message);

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("boletas").getPublicUrl(`gastos/${fileName}`);

    boletaUrl = publicUrl;
  }

  const { error } = await supabaseAdmin.from("gastos").insert([
    {
      monto,
      descripcion,
      categoria,
      fecha,
      boleta_url: boletaUrl,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function crearPago(formData: FormData) {
  await checkAuth();

  const montoNuevo = parseInt(formData.get("monto") as string);
  const alumnoId = formData.get("alumno_id") as string;
  const fechaStr = formData.get("fecha") as string;
  const file = formData.get("comprobante") as File;

  let comprobanteUrl = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split(".").pop();
    const fileName = `pago_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("boletas")
      .upload(`pagos/${fileName}`, file);

    if (uploadError) throw new Error(uploadError.message);
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("boletas").getPublicUrl(`pagos/${fileName}`);
    comprobanteUrl = publicUrl;
  }

  const { error } = await supabaseAdmin.from("pagos").insert([
    {
      alumno_id: alumnoId,
      monto: montoNuevo,
      mes: "Abono a cuenta anual",
      fecha: fechaStr,
      comprobante_url: comprobanteUrl,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function eliminarRegistro(
  tabla: "gastos" | "pagos" | "campanas" | "pagos_campanas", 
  id: string
) {
  await checkAuth();

  const { error } = await supabaseAdmin.from(tabla).delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/");
  revalidatePath("/admin");
}
