"use client";

import { HandCoins, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { crearPagoCampana } from "@/app/actions/campanas";

type PagoCampanaFormProps = {
  alumnos: { id: string; nombre: string; apellido: string }[];
  campanas: { id: string; nombre: string; monto_objetivo: number }[];
};

export default function PagoCampanaForm({ alumnos, campanas }: PagoCampanaFormProps) {
  const [loading, setLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false); // Para UX visual

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSelected(e.target.files && e.target.files.length > 0 ? true : false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await crearPagoCampana(formData);
      
      toast.success("Pago de campaña registrado con éxito");
      (e.target as HTMLFormElement).reset();
      setFileSelected(false);
    } catch (error: any) {
      toast.error("Error al registrar pago: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Si no hay campañas creadas, ocultamos el formulario o mostramos un aviso
  if (campanas.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm italic mt-6">
        No hay Campañas Extra activas. Crea una primero para registrar pagos.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-6">
      <div className="p-4 bg-fuchsia-50 flex items-center gap-2 font-bold text-fuchsia-700 border-b border-fuchsia-100">
        <HandCoins className="text-fuchsia-500" />
        Registrar Pago Extra (Campaña)
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Selección de Alumno */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Alumno</label>
            <select
              name="alumno_id"
              required
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm transition-all shadow-sm"
              defaultValue=""
            >
              <option value="" disabled>Seleccionar Apoderado/Alumno</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.apellido} {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Campaña */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Campaña a Pagar</label>
            <select
              name="campana_id"
              required
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm transition-all shadow-sm"
              defaultValue=""
            >
              <option value="" disabled>Elegir Evento</option>
              {campanas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (${c.monto_objetivo.toLocaleString("es-CL")})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Monto Pagado</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
              <input
                type="number"
                name="monto"
                required
                className="w-full pl-8 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Pago</label>
            <input
              type="date"
              name="fecha"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-fuchsia-500 outline-none text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Input de Imagen */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Comprobante o Boleta</label>
          <label className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud
                className={`w-6 h-6 mb-2 ${
                  fileSelected ? "text-fuchsia-500" : "text-slate-400"
                }`}
              />
              <p className="text-xs text-slate-500 font-medium">
                {fileSelected
                  ? "✓ Foto o PDF listo para enviar"
                  : "Presiona para subir desde Galería"}
              </p>
            </div>
            <input
              type="file"
              name="comprobante"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
             <span className="animate-spin text-xl">⏳</span>
          ) : (
             "Registrar Abono Extra"
          )}
        </button>
      </form>
    </div>
  );
}
