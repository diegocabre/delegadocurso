import { supabase } from "@/lib/supabase";
import { ArrowLeft, LogOut, ReceiptText, Users } from "lucide-react";
import Link from "next/link";
import { logout } from "../actions/auth";
import DeleteButton from "./componets/DeleteButton";
import GastoForm from "./componets/GastoForm";
import PagoForm from "./componets/PagoForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: gastos } = await supabase
    .from("gastos")
    .select("*")
    .order("fecha", { ascending: false });

  const { data: pagos } = await supabase
    .from("pagos")
    .select(`id, monto, fecha, alumnos (nombre, apellido)`)
    .order("fecha", { ascending: false });

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen text-black">
      <header className="flex justify-between items-center mb-8">
        <Link
          href="/"
          className="flex items-center text-slate-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" /> Volver al Dashboard
        </Link>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
          Sesión Activa
        </span>
      </header>

      {/* FORMULARIOS DE REGISTRO */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <PagoForm />
        <GastoForm />
      </div>

      {/* SECCIÓN DE HISTORIALES */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Tabla Historial de Pagos */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-green-50 border-b flex items-center gap-2 font-bold text-green-700">
            <Users size={18} /> Historial de Abonos
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Alumno</th>
                  <th className="p-4 font-bold">Monto</th>
                  <th className="p-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagos?.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-medium">
                      {(p.alumnos as any)?.apellido} {(p.alumnos as any)?.nombre}
                    </td>
                    <td className="p-4 text-green-600 font-bold">
                      ${p.monto.toLocaleString("es-CL")}
                    </td>
                    <td className="p-4 text-center">
                      <DeleteButton tabla="pagos" id={p.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla Historial de Gastos */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-red-50 border-b flex items-center gap-2 font-bold text-red-700">
            <ReceiptText size={18} /> Historial de Gastos
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Descripción</th>
                  <th className="p-4 font-bold">Monto</th>
                  <th className="p-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {gastos?.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium">{g.descripcion}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(g.fecha).toLocaleDateString("es-CL")}
                      </p>
                    </td>
                    <td className="p-4 text-red-600 font-bold">
                      ${g.monto.toLocaleString("es-CL")}
                    </td>
                    <td className="p-4 text-center">
                      <DeleteButton tabla="gastos" id={g.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-20 py-10 border-t flex flex-col items-center gap-4">
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-slate-400 hover:text-red-600 hover:underline flex items-center gap-1"
          >
            <LogOut size={14} /> Cerrar Sesión de Tesorería
          </button>
        </form>
      </div>
    </div>
  );
}
