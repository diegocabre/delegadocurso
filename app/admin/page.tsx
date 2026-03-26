"use client";

import { supabase } from "@/lib/supabase";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Asegúrate de que las rutas de estos componentes sean correctas
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

  // ESTADO: NO AUTENTICADO (Muestra el candado)
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
            className="w-full bg-red-600 text-white p-4 rounded-xl font-bold"
          >
            Verificar Identidad
          </button>
        </div>
      </div>
    );
  }

  // ESTADO: AUTENTICADO (Esto es lo que te faltaba en el return)
  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen text-black">
      <button
        onClick={() => router.push("/")}
        className="flex items-center text-slate-500 mb-6 hover:text-black transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" /> Volver al Dashboard
      </button>

      {/* AQUÍ VUELVEN TUS FORMULARIOS */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <PagoForm onPagoGuardado={cargarDatos} />
        <GastoForm onGastoGuardado={cargarDatos} />
      </div>

      <div className="mt-10 pt-10 border-t flex justify-center">
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
