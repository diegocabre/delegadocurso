"use client";

import { supabase } from "@/lib/supabase";
import { ArrowLeft, ReceiptText, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GastoForm from "./componets/GastoForm";
import PagoForm from "./componets/PagoForm";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [gastos, setGastos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]); // Estado para los abonos
  const router = useRouter();

  const cargarDatos = async () => {
    // 1. Cargar Gastos
    const { data: dataGastos } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });
    if (dataGastos) setGastos(dataGastos);

    // 2. Cargar Pagos (Abonos) con el nombre del alumno
    const { data: dataPagos } = await supabase
      .from("pagos")
      .select(
        `
        id,
        monto,
        fecha,
        alumnos (nombre, apellido)
      `,
      )
      .order("fecha", { ascending: false });
    if (dataPagos) setPagos(dataPagos);
  };

  useEffect(() => {
    if (isAuth) cargarDatos();
  }, [isAuth]);

  // Función para borrar registros
  const handleBorrar = async (tabla: string, id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      const { error } = await supabase.from(tabla).delete().eq("id", id);
      if (error) {
        alert("Error al borrar: " + error.message);
      } else {
        cargarDatos();
      }
    }
  };

  if (!isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center text-black">
            Acceso Tesorería
          </h2>
          <input
            type="password"
            className="w-full p-2 border rounded mb-4 text-black text-center"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && pass === "tesorero2026" && setIsAuth(true)
            }
          />
          <button
            onClick={() =>
              pass === "tesorero2026" ? setIsAuth(true) : alert("Error")
            }
            className="w-full bg-slate-900 text-white p-2 rounded font-bold"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <button
        onClick={() => router.push("/")}
        className="flex items-center text-slate-500 mb-6 hover:text-black transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" /> Volver al Dashboard
      </button>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <PagoForm onPagoGuardado={cargarDatos} />
        <GastoForm onGastoGuardado={cargarDatos} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* HISTORIAL DE ABONOS */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-green-700 font-bold border-b pb-2">
            <Users size={20} />
            <h2 className="text-lg">Historial de Abonos</h2>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {pagos.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border text-black"
              >
                <div>
                  <p className="font-bold text-sm">
                    {p.alumnos?.apellido} {p.alumnos?.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(p.fecha).toLocaleDateString("es-CL")} •
                    <span className="text-green-600 font-bold ml-1">
                      ${p.monto.toLocaleString("es-CL")}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleBorrar("pagos", p.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* HISTORIAL DE GASTOS */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-red-700 font-bold border-b pb-2">
            <ReceiptText size={20} />
            <h2 className="text-lg">Historial de Gastos</h2>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {gastos.map((g) => (
              <div
                key={g.id}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border text-black"
              >
                <div>
                  <p className="font-bold text-sm">{g.descripcion}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(g.fecha).toLocaleDateString("es-CL")} •
                    <span className="text-red-600 font-bold ml-1">
                      -${g.monto.toLocaleString("es-CL")}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleBorrar("gastos", g.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
