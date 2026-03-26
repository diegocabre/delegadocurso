"use client";

import { supabase } from "@/lib/supabase";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

export default function AlumnoForm({
  onAlumnoAgregado,
}: {
  onAlumnoAgregado: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from("alumnos").insert([
        {
          nombre: formData.get("nombre"),
          apellido: formData.get("apellido"),
        },
      ]);

      if (error) throw error;

      alert("✅ Alumno agregado correctamente");
      (e.target as HTMLFormElement).reset();
      onAlumnoAgregado(); // Para refrescar listas si es necesario
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 border rounded-2xl bg-white shadow-sm border-slate-100 space-y-4"
    >
      <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold">
        <UserPlus size={20} /> Registrar Nuevo Alumno
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">
            Nombre
          </label>
          <input
            name="nombre"
            placeholder="Ej: Diego"
            className="w-full p-2.5 border rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 ml-1 uppercase">
            Apellido
          </label>
          <input
            name="apellido"
            placeholder="Ej: Cabré"
            className="w-full p-2.5 border rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          "Guardar Alumno"
        )}
      </button>
    </form>
  );
}
