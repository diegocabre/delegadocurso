"use client";

import { supabase } from "@/lib/supabase";
import {
  Image as ImageIcon,
  ReceiptText,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ImageModal from "./components/dashboard/ImageModal";
import StatsGrid from "./components/dashboard/StatsGrid";

// Un componente simple para mostrar mientras carga la tabla (Skeleton)
function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center h-12">
          <div className="w-12 h-12 rounded-lg bg-slate-100"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [gastos, setGastos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // <--- NUEVO: Estado de carga inicial
  const [filtroAlumno, setFiltroAlumno] = useState(""); // <--- NUEVO: Estado del buscador
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const getData = useCallback(async () => {
    setLoading(true); // Iniciamos carga
    const { data: g } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });

    const { data: p } = await supabase
      .from("pagos")
      .select(
        `
        id, monto, mes, fecha, comprobante_url,
        alumnos (nombre, apellido)
      `,
      )
      .order("fecha", { ascending: false });

    if (g) setGastos(g);
    if (p) setPagos(p);
    setLoading(false); // <--- NUEVO: Finalizamos carga
  }, []);

  useEffect(() => {
    getData();

    const channel = supabase
      .channel("dashboard_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gastos" },
        () => getData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pagos" },
        () => getData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getData]);

  // --- LÓGICA DE FILTRO UI ---
  // Filtramos la lista de pagos en memoria según lo que escriba el usuario
  const pagosFiltrados = pagos.filter((p) => {
    // Verificamos que el alumno exista para evitar errores
    if (!p.alumnos) return false;
    const nombreCompleto =
      `${p.alumnos.nombre} ${p.alumnos.apellido}`.toLowerCase();
    const buscarTermino = filtroAlumno.toLowerCase();

    return nombreCompleto.includes(buscarTermino);
  });

  const totalIn = pagos.reduce((acc, p) => acc + p.monto, 0);
  const totalOut = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <main className="p-6 max-w-7xl mx-auto bg-slate-50/30 min-h-screen">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 border-b pb-6 border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white p-1">
            <Image
              src="/logo-5b.jpg"
              alt="Logo 5B"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              Tesorería 5B
            </h1>
            <p className="text-slate-500 text-sm">
              Transparencia en tiempo real ✨
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95"
        >
          🔐 Admin
        </Link>
      </header>

      {/* ESTADÍSTICAS */}
      <StatsGrid
        saldo={totalIn - totalOut}
        ingresos={totalIn}
        gastos={totalOut}
        soloPrincipales={true}
      />

      {/* ... Sección Directiva (Sin cambios) ... */}
      <section className="mb-10 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-6 items-center justify-center lg:justify-start">
        <div className="flex items-center gap-2 text-slate-400 border-r pr-6 border-slate-100 last:border-0">
          <ShieldCheck size={20} className="text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Directiva 2026
          </span>
        </div>
        {/* Delegado */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Delegado
            </span>
            <span className="text-sm font-semibold text-slate-700">
              Diego Cabré
            </span>
          </div>
          <a
            href="https://wa.me/569947637541"
            target="_blank"
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
          >
            <Users size={16} />
          </a>
        </div>
        {/* Tesorería */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Tesorería
            </span>
            <span className="text-sm font-semibold text-slate-700">
              Macarena Carvajal
            </span>
          </div>
          <a
            href="https://wa.me/56940781693"
            target="_blank"
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
          >
            <Users size={16} />
          </a>
        </div>
        {/* Tesorería BackUp */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Tesorería BackUp
            </span>
            <span className="text-sm font-semibold text-slate-700">
              Carlos Montenegro
            </span>
          </div>
          <a
            href="https://wa.me/56968404269"
            target="_blank"
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
          >
            <Users size={16} />
          </a>
        </div>
      </section>

      {/* --- BARRA DE BÚSQUEDA UI --- */}
      <div className="mb-6 max-w-md relative shadow-green-50 shadow-lg">
        <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar alumno por nombre o apellido..."
          value={filtroAlumno}
          onChange={(e) => setFiltroAlumno(e.target.value)}
          className="w-full pl-11 p-3.5 border border-slate-200 rounded-2xl text-black bg-white focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all shadow-inner"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* TABLA INGRESOS (CUOTAS) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-green-50/50 border-b flex items-center gap-2 font-bold text-green-700 border-green-100">
            <Users size={18} /> Aportes Apoderados
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-sm text-left table-auto">
              {loading ? (
                // SKELETON LOADER
                <tbody>
                  <tr>
                    <td>
                      <TableSkeleton rows={3} />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-slate-100">
                  {pagosFiltrados.length === 0 ? (
                    // CASO: NO HAY RESULTADOS
                    <tr>
                      <td className="p-10 text-center text-slate-400 italic text-xs">
                        No se encontraron pagos coincidentes.
                      </td>
                    </tr>
                  ) : (
                    pagosFiltrados.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-green-50/50 transition-colors"
                      >
                        <td className="p-4 font-medium text-slate-900 capitalize">
                          {p.alumnos?.apellido} {p.alumnos?.nombre}
                        </td>
                        <td className="p-4 text-slate-500 text-xs">{p.mes}</td>
                        <td className="p-4 text-right font-bold text-green-600 tracking-tight">
                          ${p.monto.toLocaleString("es-CL")}
                        </td>
                        <td className="p-4 text-center">
                          {p.comprobante_url && (
                            <button
                              onClick={() => setSelectedImg(p.comprobante_url)}
                              className="text-green-500 p-2 hover:bg-green-100 rounded-lg transition-colors"
                            >
                              <ImageIcon size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* TABLA EGRESOS (GASTOS) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-red-50/50 border-b flex items-center gap-2 font-bold text-red-700 border-red-100">
            <ReceiptText size={18} /> Gastos del Curso
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-sm text-left table-auto">
              {loading ? (
                // SKELETON LOADER
                <tbody>
                  <tr>
                    <td>
                      <TableSkeleton rows={3} />
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-slate-100">
                  {gastos.length === 0 ? (
                    // CASO: NO HAY GASTOS REGISTRADOS
                    <tr>
                      <td className="p-10 text-center text-slate-400 italic text-xs">
                        No hay gastos registrados aún.
                      </td>
                    </tr>
                  ) : (
                    gastos.map((g) => (
                      <tr
                        key={g.id}
                        className="hover:bg-red-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium text-slate-900 capitalize">
                            {g.descripcion}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {new Date(g.fecha).toLocaleDateString("es-CL")}
                          </p>
                        </td>
                        <td className="p-4 text-right font-bold text-red-600 tracking-tight">
                          -${g.monto.toLocaleString("es-CL")}
                        </td>
                        <td className="p-4 text-center">
                          {g.boleta_url && (
                            <button
                              onClick={() => setSelectedImg(g.boleta_url)}
                              className="text-blue-500 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <ImageIcon size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>

      {selectedImg && (
        <ImageModal url={selectedImg} onClose={() => setSelectedImg(null)} />
      )}
    </main>
  );
}
