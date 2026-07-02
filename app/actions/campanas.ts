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

async function getCursoId() {
  const cursoCodigo = process.env.NEXT_PUBLIC_CURSO_CODIGO || "CL-5B-2026";
  const { data, error } = await supabaseAdmin
    .from("cursos")
    .select("id")
    .eq("codigo", cursoCodigo)
    .single();
  if (error || !data) {
    throw new Error("Curso no configurado o no encontrado: " + (error?.message || ""));
  }
  return data.id;
}

export async function crearCampana(formData: FormData) {
  try {
    await checkAuth();

    const nombre = formData.get("nombre") as string;
    const montoObjetivo = parseInt(formData.get("monto_objetivo") as string);
    const file = formData.get("imagen") as File;

    let imagenUrl = null;

    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `portada_${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { error: uploadError } = await supabaseAdmin.storage
        .from("boletas")
        .upload(`campanas/${fileName}`, buffer, {
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        return { success: false, error: "Error subiendo foto portada: " + uploadError.message };
      }
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("boletas").getPublicUrl(`campanas/${fileName}`);
      imagenUrl = publicUrl;
    }

    const cursoId = await getCursoId();

    const { error } = await supabaseAdmin.from("campanas").insert([
      {
        curso_id: cursoId,
        nombre,
        monto_objetivo: montoObjetivo,
        imagen_url: imagenUrl,
      },
    ]);

    if (error) {
      return { success: false, error: "Error en base de datos: " + error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function crearPagoCampana(formData: FormData) {
  try {
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
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { error: uploadError } = await supabaseAdmin.storage
        .from("boletas")
        .upload(`campanas/${fileName}`, buffer, {
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        return { success: false, error: "Error subiendo archivo: " + uploadError.message };
      }
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("boletas").getPublicUrl(`campanas/${fileName}`);
      comprobanteUrl = publicUrl;
    }

    const cursoId = await getCursoId();

    const { error } = await supabaseAdmin.from("pagos_campanas").insert([
      {
        curso_id: cursoId,
        alumno_id: alumnoId,
        campana_id: campanaId,
        monto,
        fecha: fechaStr,
        comprobante_url: comprobanteUrl,
      },
    ]);

    if (error) {
      return { success: false, error: "Error en base de datos: " + error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function eliminarCampana(id: string) {
  try {
    await checkAuth();
    const { error } = await supabaseAdmin.from("campanas").delete().eq("id", id);
    if (error) {
      return { success: false, error: "Error al eliminar campaña: " + error.message };
    }
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function eliminarPagoCampana(id: string) {
  try {
    await checkAuth();
    const { error } = await supabaseAdmin.from("pagos_campanas").delete().eq("id", id);
    if (error) {
      return { success: false, error: "Error al eliminar pago: " + error.message };
    }
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function pagarCampanaConCuotaFondo(formData: FormData) {
  try {
    await checkAuth();

    const campanaId = formData.get("campana_id") as string;
    const nombreCampana = formData.get("nombre_campana") as string;
    const montoTotal = parseInt(formData.get("monto_total") as string);
    const file = formData.get("boleta") as File;

    if (isNaN(montoTotal) || montoTotal <= 0) {
      return { success: false, error: "Monto inválido" };
    }

    let boletaUrl = null;

    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `gasto_evento_${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { error: uploadError } = await supabaseAdmin.storage
        .from("boletas")
        .upload(`gastos/${fileName}`, buffer, {
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        return { success: false, error: "Error subiendo boleta: " + uploadError.message };
      }
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("boletas").getPublicUrl(`gastos/${fileName}`);
      boletaUrl = publicUrl;
    }

    // 1. Insertar el Egreso (Gasto) debitando de la cuenta del curso
    const descripcion = `Pago evento (Fondo Central): ${nombreCampana}`;
    const hoy = new Date().toISOString().split("T")[0];

    const cursoId = await getCursoId();

    const { error: gastoError } = await supabaseAdmin.from("gastos").insert([
      {
        curso_id: cursoId,
        monto: montoTotal,
        descripcion,
        categoria: "Eventos",
        fecha: hoy,
        boleta_url: boletaUrl,
      },
    ]);

    if (gastoError) {
      return { success: false, error: "Error registrando gasto: " + gastoError.message };
    }

    // 2. Actualizar el estado de la campaña a 'realizada'
    const { error: campanaError } = await supabaseAdmin
      .from("campanas")
      .update({ estado: 'realizada' })
      .eq("id", campanaId);

    if (campanaError) {
      return { success: false, error: "Error al marcar campaña como finalizada: " + campanaError.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}
