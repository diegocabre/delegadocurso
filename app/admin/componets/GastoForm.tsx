"use client";

import { supabase } from "@/lib/supabase";
import { Camera, Loader2, Receipt, Tag, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { crearGasto } from "../../actions/admin";

export default function GastoForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const monto = parseInt(formData.get("monto") as string);
    const descripcion = formData.get("descripcion") as string;
    const file = formData.get("boleta") as File;

    if (descripcion.trim().length < 3)
      return toast.warning("Descripción válida requerida");
    if (isNaN(monto) || monto <= 0) return toast.warning("Monto inválido");

    setLoading(true);

    try {
      await crearGasto(formData);

      form.reset();
      toast.success("Gasto guardado con éxito");
    } catch (error: any) {
      toast.error("Error al registrar gasto: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-5 border rounded-2xl bg-white shadow-sm border-slate-100"
    >
      {/* ... (Todo el resto de tu JSX igual) ... */}
      <div className="flex items-center gap-2 mb-3 text-red-600 font-bold border-b pb-3 border-slate-100">
        <Receipt size={22} />
        <div>
          <h3 className="text-lg font-black">Registrar Egreso</h3>
          <p className="text-xs text-slate-500 font-normal">Salida de fondos</p>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 ml-1 flex items-center gap-1 mb-1 uppercase tracking-wider">
          <Tag size={12} /> Detalle
        </label>
        <input
          name="descripcion"
          placeholder="Ej: Compra de carbón..."
          className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-red-500 outline-none text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block uppercase tracking-wider">
            Monto ($)
          </label>
          <input
            name="monto"
            type="number"
            className="w-full p-3 border rounded-lg text-black font-bold focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block uppercase tracking-wider">
            Fecha
          </label>
          <input
            name="fecha"
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-red-500 outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block uppercase tracking-wider">
          Categoría
        </label>
        <select
          name="categoria"
          className="w-full p-3 border rounded-lg text-black bg-white focus:ring-2 focus:ring-red-500 outline-none text-sm"
        >
          <option value="Eventos">Eventos / Convivencias</option>
          <option value="Regalos">Regalos / Premios</option>
          <option value="Materiales">Materiales de estudio</option>
          <option value="Otros">Otros gastos</option>
        </select>
      </div>

      <div className="bg-red-50/50 p-4 rounded-xl border border-dashed border-red-200 flex flex-col items-center gap-2 text-center">
        <Camera className="text-red-400" size={24} />
        <span className="text-xs text-red-900 font-bold">
          Foto de Boleta / Recibo
        </span>
        <input
          name="boleta"
          type="file"
          accept="image/*"
          className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-red-100 file:text-red-700 cursor-pointer"
        />
      </div>

      <button
        disabled={loading}
        className="w-full bg-red-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-700 transition-all disabled:bg-slate-300 shadow-lg shadow-red-100"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <Wallet size={18} /> Guardar Gasto
          </>
        )}
      </button>
    </form>
  );
}
