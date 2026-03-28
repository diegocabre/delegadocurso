"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { eliminarRegistro } from "@/app/actions/admin";
import { toast } from "sonner";

export default function DeleteButton({
  tabla,
  id,
}: {
  tabla: "gastos" | "pagos" | "campanas" | "pagos_campanas";
  id: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.",
      )
    )
      return;

    startTransition(async () => {
      try {
        await eliminarRegistro(tabla, id);
      } catch (error: any) {
        alert("Error al eliminar: " + error.message);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 p-2 disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
