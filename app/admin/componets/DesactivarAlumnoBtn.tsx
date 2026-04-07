"use client";

import { UserMinus } from "lucide-react";
import { useTransition } from "react";
import { desactivarAlumno } from "@/app/actions/admin";
import { toast } from "sonner";

export default function DesactivarAlumnoBtn({
  id,
  nombreCompleto
}: {
  id: string;
  nombreCompleto: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDesactivar = () => {
    if (
      !confirm(
        `¿Estás seguro de desactivar al alumno ${nombreCompleto}? Dejará de aparecer en las listas de cobros, pero su historial de pagos se mantendrá.`
      )
    )
      return;

    startTransition(async () => {
      try {
        await desactivarAlumno(id);
        toast.success(`Alumno ${nombreCompleto} desactivado correctamente.`);
      } catch (error: any) {
        toast.error("Error al desactivar: " + error.message);
      }
    });
  };

  return (
    <button
      onClick={handleDesactivar}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 p-2 disabled:opacity-50 transition-colors"
      title="Desactivar Alumno (Borrado Lógico)"
    >
      <UserMinus size={16} />
    </button>
  );
}
