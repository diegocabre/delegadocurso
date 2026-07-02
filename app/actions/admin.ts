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

export async function crearGasto(formData: FormData) {
  try {
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
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { error: uploadError } = await supabaseAdmin.storage
        .from("boletas")
        .upload(`gastos/${fileName}`, buffer, {
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        return { success: false, error: "Error al subir boleta: " + uploadError.message };
      }

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("boletas").getPublicUrl(`gastos/${fileName}`);

      boletaUrl = publicUrl;
    }

    const cursoId = await getCursoId();

    const { error } = await supabaseAdmin.from("gastos").insert([
      {
        curso_id: cursoId,
        monto,
        descripcion,
        categoria,
        fecha,
        boleta_url: boletaUrl,
      },
    ]);

    if (error) {
      return { success: false, error: "Error en base de datos: " + error.message };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function crearPago(formData: FormData) {
  try {
    await checkAuth();

    const montoNuevo = parseInt(formData.get("monto") as string);
    const alumnoId = formData.get("alumno_id") as string;
    const fechaStr = formData.get("fecha") as string;
    const file = formData.get("comprobante") as File;

    let comprobanteUrl = null;

    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `pago_${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { error: uploadError } = await supabaseAdmin.storage
        .from("boletas")
        .upload(`pagos/${fileName}`, buffer, {
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        return { success: false, error: "Error al subir comprobante: " + uploadError.message };
      }
      const {
        data: { publicUrl },
      } = supabaseAdmin.storage.from("boletas").getPublicUrl(`pagos/${fileName}`);
      comprobanteUrl = publicUrl;
    }

    const cursoId = await getCursoId();

    const { error } = await supabaseAdmin.from("pagos").insert([
      {
        curso_id: cursoId,
        alumno_id: alumnoId,
        monto: montoNuevo,
        mes: "Abono a cuenta anual",
        fecha: fechaStr,
        comprobante_url: comprobanteUrl,
      },
    ]);

    if (error) {
      return { success: false, error: "Error en base de datos: " + error.message };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function eliminarRegistro(
  tabla: "gastos" | "pagos" | "campanas" | "pagos_campanas", 
  id: string
) {
  try {
    await checkAuth();

    const { error } = await supabaseAdmin.from(tabla).delete().eq("id", id);
    if (error) {
      return { success: false, error: "Error al eliminar: " + error.message };
    }
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function desactivarAlumno(id: string) {
  try {
    await checkAuth();

    const { error } = await supabaseAdmin
      .from("alumnos")
      .update({ activo: false })
      .eq("id", id);
      
    if (error) {
      return { success: false, error: "Error al desactivar: " + error.message };
    }
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error desconocido" };
  }
}

export async function crearAlumno(formData: FormData) {
  try {
    await checkAuth();

    const nombre = formData.get("nombre") as string;
    const apellido = formData.get("apellido") as string;

    const cursoId = await getCursoId();

    const { error } = await supabaseAdmin.from("alumnos").insert([
      {
        curso_id: cursoId,
        nombre,
        apellido,
        activo: true
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
