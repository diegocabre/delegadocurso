"use client";

import { supabase } from "@/lib/supabase";
import {
  Image as ImageIcon,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ImageModal from "./components/dashboard/ImageModal";
import StatsGrid from "./components/dashboard/StatsGrid";

export default function DashboardPage() {
  const [gastos, setGastos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // 1. Lógica de carga de datos envuelta en useCallback
  const getData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // Carga inicial
    getData();

    // 2. Suscripción Realtime para actualizar automáticamente
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

  const totalIn = pagos.reduce((acc, p) => acc + p.monto, 0);
  const totalOut = gastos.reduce((acc, g) => acc + g.monto, 0);

  return (
    <main className="p-6 max-w-7xl mx-auto bg-slate-50/30 min-h-screen">
      {/* HEADER CON LOGO 5B */}
      <header className="flex justify-between items-center mb-10 border-b pb-6 border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white p-1">
            <Image
              src="/logo-5b.jpg"
              alt="Logo 5B"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-sans">
              Tesorería del Curso
            </h1>
            <p className="text-slate-500 text-sm">
              Transparencia en tiempo real ✨
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 bg-white border rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          🔐 Panel Admin
        </Link>
      </header>

      {/* ESTADÍSTICAS */}
      <StatsGrid
        saldo={totalIn - totalOut}
        ingresos={totalIn}
        gastos={totalOut}
        soloPrincipales={true}
      />

      {/* SECCIÓN DE DIRECTIVA CON CONTACTO */}
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
            href="https://wa.me/56947637541?text=Hola%20Diego,%20soy%20apoderado%20del%205B..."
            target="_blank"
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
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
            href="https://wa.me/56940781693?text=Hola%20Macarena,%20tengo%20una%20duda%20con%20un%20pago%20del%205B..."
            target="_blank"
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
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
            href="https://wa.me/56968404269?text=Hola%20Carlos,%20contacto%20desde%20el%20Dashboard%20del%205B..."
            target="_blank"
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
          >
            <Users size={16} />
          </a>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* TABLA INGRESOS (CUOTAS) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-green-50/50 border-b flex items-center gap-2 font-bold text-green-700">
            <Users size={18} /> Aportes Apoderados
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                {pagos.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-900">
                      {p.alumnos?.apellido} {p.alumnos?.nombre}
                    </td>
                    <td className="p-4 text-slate-500">{p.mes}</td>
                    <td className="p-4 text-right font-bold text-green-600">
                      ${p.monto.toLocaleString("es-CL")}
                    </td>
                    <td className="p-4 text-center">
                      {p.comprobante_url && (
                        <button
                          onClick={() => setSelectedImg(p.comprobante_url)}
                          className="text-green-500 p-1 hover:bg-green-50 rounded"
                        >
                          <ImageIcon size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA EGRESOS (GASTOS) */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-red-50/50 border-b flex items-center gap-2 font-bold text-red-700">
            <ReceiptText size={18} /> Gastos del Curso
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                {gastos.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-slate-900">
                        {g.descripcion}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase">
                        {new Date(g.fecha).toLocaleDateString("es-CL")}
                      </p>
                    </td>
                    <td className="p-4 text-right font-bold text-red-600">
                      -${g.monto.toLocaleString("es-CL")}
                    </td>
                    <td className="p-4 text-center">
                      {g.boleta_url && (
                        <button
                          onClick={() => setSelectedImg(g.boleta_url)}
                          className="text-blue-500 p-1 hover:bg-blue-50 rounded"
                        >
                          <ImageIcon size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
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
