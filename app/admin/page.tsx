"use client";

import { supabase } from "@/lib/supabase";
import { ArrowLeft, Lock, ReceiptText, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GastoForm from "./componets/GastoForm";
import PagoForm from "./componets/PagoForm";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [gastos, setGastos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const authCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_auth="))
      ?.split("=")[1];

    if (authCookie) setIsAuth(true);
  }, []);

  const cargarDatos = async () => {
    const { data: dGastos } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });
    const { data: dPagos } = await supabase
      .from("pagos")
      .select(`id, monto, fecha, alumnos (nombre, apellido)`)
      .order("fecha", { ascending: false });

    if (dGastos) setGastos(dGastos);
    if (dPagos) setPagos(dPagos);
  };

  useEffect(() => {
    if (isAuth) cargarDatos();
  }, [isAuth]);

  const handleLogin = async () => {
    const res = await fetch("/api/auth-admin", {
      method: "POST",
      body: JSON.stringify({ pass }),
    });

    if (res.ok) {
      document.cookie = `admin_auth=${pass}; path=/; max-age=86400; SameSite=Strict`;
      setIsAuth(true);
    } else {
      alert("Clave incorrecta");
    }
  };

  const eliminarRegistro = async (tabla: string, id: string) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.",
      )
    )
      return;

    const { error } = await supabase.from(tabla).delete().eq("id", id);
    if (error) alert("Error al eliminar: " + error.message);
    else cargarDatos(); // Refresca las tablas
  };

  if (!isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="flex justify-center mb-4 text-red-600">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black mb-6 text-center text-slate-800">
            Panel de Control
          </h2>
          <input
            type="password"
            className="w-full p-4 border-2 border-slate-100 rounded-xl mb-4 text-black text-center outline-none"
            placeholder="Ingrese Clave Maestra"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-red-600 text-white p-4 rounded-xl font-bold transition-all hover:bg-red-700"
          >
            Verificar Identidad
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen text-black">
      <header className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-slate-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" /> Volver al Dashboard
        </button>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
          Sesión Activa
        </span>
      </header>

      {/* FORMULARIOS DE REGISTRO */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <PagoForm onPagoGuardado={cargarDatos} />
        <GastoForm onGastoGuardado={cargarDatos} />
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
                {pagos.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-medium">
                      {p.alumnos?.apellido} {p.alumnos?.nombre}
                    </td>
                    <td className="p-4 text-green-600 font-bold">
                      ${p.monto.toLocaleString("es-CL")}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => eliminarRegistro("pagos", p.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
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
                {gastos.map((g) => (
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
                      <button
                        onClick={() => eliminarRegistro("gastos", g.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-20 py-10 border-t flex flex-col items-center gap-4">
        <button
          onClick={() => {
            document.cookie =
              "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            window.location.reload();
          }}
          className="text-xs text-slate-400 hover:underline"
        >
          Cerrar Sesión de Tesorería
        </button>
      </div>
    </div>
  );
}
