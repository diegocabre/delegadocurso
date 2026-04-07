"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { crearAlumno } from "@/app/actions/admin";

export default function AlumnoForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await crearAlumno(formData);
      toast.success("Alumno agregado correctamente");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 border rounded-2xl bg-white shadow-sm border-slate-100 space-y-4"
    >
      <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold border-b border-slate-100 pb-3">
        <UserPlus size={22} className="text-blue-500" /> 
        <div>
          <h3 className="text-lg font-black">Registrar Nuevo Alumno</h3>
          <p className="text-xs text-slate-500 font-normal tracking-tight">Agregar estudiante al curso</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 block uppercase tracking-wider mb-1">
            Nombre
          </label>
          <input
            name="nombre"
            placeholder="Ej: Diego"
            className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all font-medium"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 block uppercase tracking-wider mb-1">
            Apellido
          </label>
          <input
            name="apellido"
            placeholder="Ej: Cabré"
            className="w-full p-3 border rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 transition-all font-medium"
            required
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition-all disabled:bg-slate-300 mt-2"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          "Guardar Alumno"
        )}
      </button>
    </form>
  );
}
