"use client";

import { supabase } from "@/lib/supabase";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Función para setear cookie básica (esto se debería hacer en un API Route para máxima seguridad)
const setAdminCookie = (value: string) => {
  document.cookie = `admin_auth=${value}; path=/; max-age=86400; SameSite=Strict`;
};

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [gastos, setGastos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const router = useRouter();

  // Al cargar, verificamos si ya existe la cookie
  useEffect(() => {
    const authCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_auth="))
      ?.split("=")[1];

    if (authCookie) {
      setIsAuth(true);
    }
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
    // Llamamos a una API Route para validar la clave sin exponerla
    const res = await fetch("/api/auth-admin", {
      method: "POST",
      body: JSON.stringify({ pass }),
    });

    if (res.ok) {
      setAdminCookie(pass);
      setIsAuth(true);
    } else {
      alert("Clave incorrecta");
    }
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
            className="w-full p-4 border-2 border-slate-100 rounded-xl mb-4 text-black text-center focus:border-red-500 outline-none transition-all"
            placeholder="Ingrese Clave Maestra"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-red-200"
          >
            Verificar Identidad
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-slate-50 min-h-screen text-black">
      {/* ... (Tu código de dashboard que ya tienes) ... */}
      <button
        onClick={() => {
          document.cookie =
            "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          window.location.reload();
        }}
        className="text-xs text-slate-400 mt-10 hover:underline"
      >
        Cerrar Sesión de Tesorería
      </button>
    </div>
  );
}
