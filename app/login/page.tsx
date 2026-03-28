"use client";

import { Lock } from "lucide-react";
import { useState, useTransition } from "react";
import { login } from "../actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      const res = await login(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex justify-center mb-4 text-red-600">
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black mb-6 text-center text-slate-800">
          Panel de Control
        </h2>
        
        {error && (
          <div className="mb-4 text-center text-sm text-red-600 bg-red-100 p-2 rounded-lg font-bold">
            {error}
          </div>
        )}

        <form action={handleAction} className="space-y-4">
          <input
            name="password"
            type="password"
            className="w-full p-4 border-2 border-slate-100 rounded-xl text-black text-center outline-none focus:border-red-500 transition-colors"
            placeholder="Ingrese Clave Maestra"
            required
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-red-600 text-white p-4 rounded-xl font-bold transition-all hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isPending ? "Verificando..." : "Verificar Identidad"}
          </button>
        </form>
      </div>
    </div>
  );
}
