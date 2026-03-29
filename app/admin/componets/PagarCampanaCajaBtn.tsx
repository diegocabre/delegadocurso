"use client";

import { pagarCampanaConCuotaFondo } from "@/app/actions/campanas";
import { CreditCard, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PagarCampanaCajaBtn({
  campanaId,
  nombreCampana,
}: {
  campanaId: string;
  nombreCampana: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSelected(e.target.files && e.target.files.length > 0 ? true : false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("campana_id", campanaId);
      formData.append("nombre_campana", nombreCampana);

      await pagarCampanaConCuotaFondo(formData);
      
      toast.success("Evento pagado exitosamente desde la cuota central");
      setIsOpen(false);
    } catch (error: any) {
      toast.error("Error al registrar pago: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-full text-xs font-bold transition-colors shadow-sm cursor-pointer"
        title="Pagar evento debitando de los fondos del curso"
      >
        <CreditCard size={14} /> Pagar con Fondo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="text-green-600" size={18} /> Pagar desde Cuenta Central
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 rounded-full transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-600 bg-green-50 p-3 rounded-lg border border-green-100 leading-relaxed shadow-inner">
                Al confirmar, se registrará un <b>Egreso</b> en la Tesorería restando el dinero del fondo del curso, y la campaña <b>{nombreCampana}</b> se marcará como pagada o "Realizada".
              </p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Monto Total del Evento ($)
                </label>
                <input
                  type="number"
                  name="monto_total"
                  required
                  placeholder="Ej: 50000"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm bg-slate-50 transition-all font-medium shadow-sm"
                />
              </div>

               <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Boleta o Recibo (Opcional)
                </label>
                <label className="relative flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-300 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <UploadCloud size={18} className={fileSelected ? "text-green-500" : ""} />
                    <span className="text-xs font-medium">
                      {fileSelected ? "✓ Archivo adjuntado" : "Subir boleta para el gasto"}
                    </span>
                  </div>
                  <input
                    type="file"
                    name="boleta"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin text-xl">⏳</span>
                  ) : (
                    "Confirmar Pago e Ingresar Egreso"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
