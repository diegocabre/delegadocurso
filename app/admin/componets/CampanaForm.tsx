"use client";

import { crearCampana } from "@/app/actions/campanas";
import { HandCoins, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CampanaForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await crearCampana(formData);

      toast.success("Campaña creada con éxito");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Error al crear campaña: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden mt-6">
      <div className="p-4 bg-purple-50 flex items-center gap-2 font-bold text-purple-700 border-b border-purple-100">
        <HandCoins className="text-purple-500" />
        Lanzar Nueva Campaña (Ej: Pascua)
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Nombre del Evento
          </label>
          <input
            type="text"
            name="nombre"
            placeholder="Ej: Regalos de Navidad"
            required
            className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-slate-50 transition-all font-medium active:scale-[0.99]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Costo por Alumno ($)
          </label>
          <input
            type="number"
            name="monto_objetivo"
            placeholder="Ej: 3500"
            required
            className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-slate-50 transition-all font-medium active:scale-[0.99]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Foto de Portada (Opcional)
          </label>
          <input
            type="file"
            name="imagen"
            accept="image/*"
            className="w-full p-2 border border-slate-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 bg-slate-50 outline-none text-sm cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
        >
          {loading ? (
            <span className="animate-spin text-xl">⏳</span>
          ) : (
            <>
              <PlusCircle size={18} /> Crear Campaña
            </>
          )}
        </button>
      </form>
    </div>
  );
}
