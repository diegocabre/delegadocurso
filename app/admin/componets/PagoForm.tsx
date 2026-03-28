"use client";

import { supabase } from "@/lib/supabase";
import { Banknote, Camera, Loader2, UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { crearPago } from "../../actions/admin";

export default function PagoForm() {
  const [loading, setLoading] = useState(false);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [buscandoAlumnos, setBuscandoAlumnos] = useState(true);
  const CUOTA_ANUAL = 50000;

  const cargarAlumnosConSaldos = useCallback(async () => {
    setBuscandoAlumnos(true);
    const { data, error } = await supabase
      .from("alumnos")
      .select(`id, nombre, apellido, pagos (monto)`)
      .order("apellido", { ascending: true });

    if (error) {
      toast.error("Error cargando alumnos: " + error.message);
    } else {
      const alumnosConSaldo = data.map((alumno: any) => {
        const pagado =
          alumno.pagos?.reduce((sum: number, p: any) => sum + p.monto, 0) || 0;
        return {
          ...alumno,
          pagado,
          saldo: CUOTA_ANUAL - pagado,
        };
      });
      setAlumnos(alumnosConSaldo);
    }
    setBuscandoAlumnos(false);
  }, []);

  useEffect(() => {
    cargarAlumnosConSaldos();
  }, [cargarAlumnosConSaldos]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const montoNuevo = parseInt(formData.get("monto") as string);
    const alumnoId = formData.get("alumno_id");
    const file = formData.get("comprobante") as File;

    if (!alumnoId) return toast.warning("Selecciona un alumno.");
    const alumnoSeleccionado = alumnos.find((a) => a.id === alumnoId);

    if (alumnoSeleccionado && alumnoSeleccionado.saldo <= 0) {
      return toast.info(`${alumnoSeleccionado.nombre} ya completó su cuota anual.`);
    }

    if (isNaN(montoNuevo) || montoNuevo <= 0)
      return toast.warning("El monto debe ser mayor a 0.");

    setLoading(true);

    try {
      await crearPago(formData);

      toast.success("Abono registrado con éxito");
      form.reset();
      await cargarAlumnosConSaldos();
    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-5 border rounded-2xl bg-white shadow-sm border-slate-100"
    >
      {/* ... El resto de tu JSX se mantiene igual ... */}
      <div className="flex items-center gap-2 mb-3 text-green-600 font-bold border-b pb-3 border-slate-100">
        <Banknote size={22} />
        <div>
          <h3 className="text-lg font-black">Registrar Abono</h3>
          <p className="text-xs text-slate-500 font-normal tracking-tight">
            Cuota anual: ${CUOTA_ANUAL.toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 ml-1 flex items-center gap-1 mb-1 uppercase tracking-wider">
          <UserCheck size={12} /> Seleccionar Alumno y Ver Saldo
        </label>
        <select
          name="alumno_id"
          className="w-full p-3 border rounded-lg text-black bg-white focus:ring-2 focus:ring-green-500 outline-none text-sm"
          required
        >
          <option value="">-- Buscar Alumno --</option>
          {alumnos.map((a) => (
            <option
              key={a.id}
              value={a.id}
              className={
                a.saldo <= 0 ? "text-green-600 font-bold" : "text-black"
              }
            >
              {a.apellido} {a.nombre} —{" "}
              {a.saldo <= 0
                ? "✅ PAGADO"
                : `Faltan: $${a.saldo.toLocaleString("es-CL")}`}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 ml-1 mb-1 block uppercase tracking-wider">
            Monto a abonar ($)
          </label>
          <input
            name="monto"
            type="number"
            className="w-full p-3 border rounded-lg text-black font-bold focus:ring-2 focus:ring-green-500 outline-none"
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
            className="w-full p-3 border rounded-lg text-black focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>
      </div>

      <div className="bg-green-50/50 p-4 rounded-xl border border-dashed border-green-200 flex flex-col items-center gap-2 text-center">
        <Camera className="text-green-400" size={24} />
        <span className="text-xs text-green-900 font-bold">
          Comprobante (Opcional)
        </span>
        <input
          name="comprobante"
          type="file"
          accept="image/*"
          capture="environment"
          className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-green-100 file:text-green-700 cursor-pointer"
        />
      </div>

      <button
        disabled={loading || buscandoAlumnos}
        className="w-full bg-green-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 transition-all disabled:bg-slate-300"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          "Confirmar Abono"
        )}
      </button>
    </form>
  );
}
