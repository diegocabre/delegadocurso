// app/components/dashboard/StatsGrid.tsx
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export default function StatsGrid({
  saldo,
  ingresos,
  gastos,
  soloPrincipales,
}: any) {
  const stats = [
    {
      title: "Saldo Total",
      amount: saldo,
      color: "bg-blue-50 text-blue-600",
      icon: <Wallet />,
    },
    {
      title: "Total Ingresos",
      amount: ingresos,
      color: "bg-green-50 text-green-600",
      icon: <ArrowUpCircle />,
    },
    {
      title: "Total Egresos",
      amount: gastos,
      color: "bg-red-50 text-red-600",
      icon: <ArrowDownCircle />,
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12`}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md"
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}
          >
            {stat.icon}
          </div>
          <p className="text-sm font-medium text-slate-500">{stat.title}</p>
          <h3 className="text-2xl font-bold text-slate-900">
            ${stat.amount.toLocaleString("es-CL")}
          </h3>
        </div>
      ))}
    </div>
  );
}
