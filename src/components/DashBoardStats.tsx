import { Banknote, User, BadgePercent, ActivitySquare } from "lucide-react";
import StatCard from "@/components/ui/statrCard";

export default function DashboardStats() {
  return (
    <div className="w-full px-6 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Banknote size={16} />}
          label="TOTAL SALES"
          value="UGX. 30M"
          trend={{ value: "2.25%", isPositive: true }}
        />
        <StatCard
          icon={<User size={16} />}
          label="ASSIGNED TASKS"
          value="20"
        />
        <StatCard
          icon={<BadgePercent size={16} />}
          label="TOTAL LEADS"
          value="500"
          trend={{ value: "1.2%", isPositive: false }}
        />
        <StatCard
          icon={<ActivitySquare size={16} />}
          label="CONVERSION RATE"
          value="15%"
          trend={{ value: "3.00%", isPositive: true }}
        />
      </div>
    </div>
  );
}
