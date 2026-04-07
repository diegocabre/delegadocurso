import { supabase } from "@/lib/supabase";
import { ArrowLeft, HandCoins, LogOut, ReceiptText, Users } from "lucide-react";
import Link from "next/link";
import { logout } from "../actions/auth";
import CampanaForm from "./componets/CampanaForm";
import DeleteButton from "./componets/DeleteButton";
import DesactivarAlumnoBtn from "./componets/DesactivarAlumnoBtn";
import AlumnoForm from "./componets/AlumnoForm";
import GastoForm from "./componets/GastoForm";
import PagarCampanaCajaBtn from "./componets/PagarCampanaCajaBtn";
import PagoCampanaForm from "./componets/PagoCampanaForm";
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

  // Nuevas consultas para el Módulo de Campañas
  const { data: alumnos } = await supabase
    .from("alumnos")
    .select("*")
    .eq("activo", true)
    .order("apellido");

  const { data: campanas } = await supabase
    .from("campanas")
    .select("*")
    .order("fecha_creacion", { ascending: false });

  const { data: pagosCampanas } = await supabase
    .from("pagos_campanas")
    .select(`id, monto, fecha, alumnos(nombre, apellido), campanas(nombre)`)
    .order("fecha", { ascending: false });

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen text-black">
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

      {/* BLOQUE 1: CORE (CUOTA ANUAL Y GASTOS) */}
      <h2 className="text-xl font-black text-slate-800 mb-4 border-b pb-2">
        Gestión Tesorería Central (Cuota Anual)
      </h2>
      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        <PagoForm />
        <GastoForm />
      </div>

      {/* BLOQUE: ALUMNOS */}
      <h2 className="text-xl font-black text-slate-800 mb-4 border-b pb-2">
        Gestión de Integrantes del Curso
      </h2>
      <div className="grid lg:grid-cols-2 gap-6 mb-12 items-start">
        <AlumnoForm />
        
        {/* Lista de Alumnos */}
        <div className="bg-white rounded-2xl border shadow-sm flex flex-col max-h-[350px]">
          <div className="p-4 bg-blue-50 border-b flex items-center gap-2 font-bold text-blue-700 w-full shrink-0">
            <Users size={18} /> Alumnos Activos ({alumnos?.length || 0})
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            <div className="flex flex-wrap gap-2">
              {alumnos?.map(a => (
                <div key={a.id} className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full pl-4 pr-1 py-1 text-sm shadow-sm transition-colors">
                  <span className="font-semibold text-slate-700">{a.apellido} {a.nombre}</span>
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  <DesactivarAlumnoBtn id={a.id} nombreCompleto={`${a.nombre} ${a.apellido}`} />
                </div>
              ))}
              {alumnos?.length === 0 && (
                 <p className="text-sm text-slate-500 italic w-full text-center py-4">No hay alumnos registrados.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: MÓDULO DE CAMPAÑAS/EXTRAORDINARIOS */}
      <h2 className="text-xl font-black text-purple-800 mb-4 border-b border-purple-200 pb-2">Eventos y Campañas Extraordinarias</h2>
      
      {/* LISTA DE CAMPAÑAS ACTIVAS (MOVIDA ARRIBA PARA VISIBILIDAD) */}
      {campanas && campanas.length > 0 && (
        <div className="mb-6 bg-white p-5 border border-purple-100 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Campañas Activas (Puedes eliminarlas aquí)</h3>
          <div className="flex flex-wrap gap-3">
            {campanas.map(c => (
              <div key={c.id} className="inline-flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-full pl-4 pr-1 py-1 shadow-sm">
                <span className="text-sm font-bold text-purple-800">{c.nombre} <span className="text-purple-500 font-normal">(${c.monto_objetivo.toLocaleString("es-CL")})</span></span>
                {c.estado === "realizada" ? (
                  <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold ml-1">REALIZADO</span>
                ) : (
                  <PagarCampanaCajaBtn campanaId={c.id} nombreCampana={c.nombre} />
                )}
                <div className="h-4 w-px bg-purple-200 mx-1"></div>
                <DeleteButton tabla="campanas" id={c.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-12 items-start">
        <CampanaForm />
        <PagoCampanaForm alumnos={alumnos || []} campanas={campanas || []} />
      </div>

      {/* SECCIÓN DE HISTORIALES */}
      <h2 className="text-xl font-black text-slate-800 mb-4 border-b pb-2">
        Registros y Auditoría
      </h2>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tabla Historial de Pagos (Cuota Anual) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-green-50 border-b flex items-center gap-2 font-bold text-green-700 w-full shrink-0">
            <Users size={18} /> Abonos (Cuota Anual)
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
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
                      {(p.alumnos as any)?.apellido}{" "}
                      {(p.alumnos as any)?.nombre}
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

        {/* Tabla Historial Pagos Extraordinarios */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-purple-50 border-b flex items-center gap-2 font-bold text-purple-700 w-full shrink-0">
            <HandCoins size={18} /> Abonos (Eventos Extra)
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="p-4 font-bold">Alumno / Evento</th>
                  <th className="p-4 font-bold">Monto</th>
                  <th className="p-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagosCampanas?.map((pc) => (
                  <tr
                    key={pc.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-slate-800">
                        {(pc.alumnos as any)?.apellido}{" "}
                        {(pc.alumnos as any)?.nombre}
                      </p>
                      <p className="text-[10px] font-bold text-purple-600 uppercase">
                        {(pc.campanas as any)?.nombre}
                      </p>
                    </td>
                    <td className="p-4 text-purple-600 font-bold">
                      ${pc.monto.toLocaleString("es-CL")}
                    </td>
                    <td className="p-4 text-center">
                      <DeleteButton tabla="pagos_campanas" id={pc.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla Historial de Gastos */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-red-50 border-b flex items-center gap-2 font-bold text-red-700 w-full shrink-0">
            <ReceiptText size={18} /> Últimos Egresos
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
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
