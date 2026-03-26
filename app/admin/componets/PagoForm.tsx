"use client";

import { supabase } from "@/lib/supabase";
import { Banknote, Camera, Loader2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function PagoForm({
  onPagoGuardado,
}: {
  onPagoGuardado: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [buscandoAlumnos, setBuscandoAlumnos] = useState(true);

  useEffect(() => {
    async function cargarAlumnos() {
      const { data, error } = await supabase
        .from("alumnos")
        .select("id, nombre, apellido")
        .order("apellido", { ascending: true });

      if (error) console.error("Error cargando alumnos:", error);
      else setAlumnos(data || []);
      setBuscandoAlumnos(false);
    }
    cargarAlumnos();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const monto = parseInt(formData.get("monto") as string);
    const alumnoId = formData.get("alumno_id");
    const fechaStr = formData.get("fecha") as string;
    const file = formData.get("comprobante") as File;

    // --- VALIDACIONES ---
    if (!alumnoId) return alert("⚠️ Selecciona un alumno.");
    if (isNaN(monto) || monto <= 0) return alert("⚠️ El monto debe ser mayor a 0.");
    if (new Date(fechaStr) > new Date()) return alert("⚠️ La fecha no puede ser futura.");

    setLoading(true);
    let comprobanteUrl = null;

    try {
      if (file && file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const fileName = `pago_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("boletas")
          .upload(`pagos/${fileName}`, file);

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("boletas").getPublicUrl(`pagos/${fileName}`);
        comprobanteUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from("pagos").insert([{
        alumno_id: alumnoId,
        monto: monto,
        mes: "Abono a cuenta anual",
        fecha: fechaStr,
        comprobante_url: comprobanteUrl,
      }]);

      if (insertError) throw insertError;

      alert("✅ Abono registrado con éxito");
      (e.target as HTMLFormElement).reset();
      onPagoGuardado();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 border rounded-2xl bg-white shadow-sm border-slate-100">
      <div className="flex items-center gap-2 mb-3 text-green-600 font-bold border-b pb-3 border-slate-100">
        <Banknote size={22} />
        <div>
          <h3 className="text-lg">Registrar Abono</h3>
          <p className="text-xs text-slate-500 font-normal font-sans">Aporte anual: $72.000 por alumno</p>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 ml-1 flex items-center gap-1 mb-1 uppercase tracking-wider">
          <UserCheck size={12} /> Alumno
        </label>
        <select name="alumno_id" className="w-full p-3 border rounded-lg text-black bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-sm" required>
          <option value="">-- Seleccionar Alumno --</option>
          {alumnos.map((a) => <option key={a.id} value={a.id}>{a.apellido}, {a.nombre}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block uppercase tracking-wider">Monto ($)</label>
          <input name="monto" type="number" placeholder="Ej: 7200" className="w-full p-3 border rounded-lg text-black font-bold focus:ring-2 focus:ring-green-500 outline-none" required />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block uppercase tracking-wider">Fecha de Pago</label>
          <input name="fecha" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-green-500 outline-none" required />
        </div>
      </div>

      <div className="bg-green-50/50 p-4 rounded-xl border border-dashed border-green-200 flex flex-col items-center gap-2 text-center">
        <Camera className="text-green-400" size={24} />
        <span className="text-xs text-green-900 font-bold">Comprobante de Transferencia</span>
        <input name="comprobante" type="file" accept="image/*" capture="environment" className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-green-100 file:text-green-700 cursor-pointer" />
      </div>

      <button disabled={loading} className="w-full bg-green-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition-all disabled:bg-slate-300">
        {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Abono"}
      </button>
    </form>
  );
}