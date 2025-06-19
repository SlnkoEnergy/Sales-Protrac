import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <div className="border rounded-xl px-8 py-6 bg-white shadow-sm min-h-[140px] flex flex-col justify-between">
      <div className="flex items-center gap-3 text-gray-500 text-base font-semibold">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-3xl font-bold text-black mt-2">{value}</div>
      {trend && (
        <div
          className={`text-base font-medium flex items-center gap-1 ${
            trend.isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend.isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          {trend.value}
        </div>
      )}
    </div>
  );
}
