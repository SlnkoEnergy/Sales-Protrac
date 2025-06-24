import { useEffect, useState } from "react";
import { Banknote, User, BadgePercent, ActivitySquare } from "lucide-react";
import StatCard from "@/components/ui/statrCard";
import { getSummary } from "@/services/leads/Dashboard"; // ✅ Use this API

export default function DashboardStats() {
  const [stats, setStats] = useState({
    total_leads: 0,
    conversion_rate_percentage: 0,
    assigned_tasks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSummary();
        setStats({
          total_leads: data.total_leads ?? 0,
          conversion_rate_percentage: data.conversion_rate_percentage ?? 0,
          assigned_tasks: data.assigned_tasks ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={<Banknote size={20} />}
          label="TOTAL SALES"
          value="UGX. 30M" // Static value
          trend={{ value: "2.25%", isPositive: true }}
        />
        <StatCard
          icon={<User size={20} />}
          label="ASSIGNED TASKS"
          value={stats.assigned_tasks.toString()}
        />
        <StatCard
          icon={<BadgePercent size={20} />}
          label="TOTAL LEADS"
          value={stats.total_leads.toString()}
          trend={{ value: "1.2%", isPositive: false }}
        />
        <StatCard
          icon={<ActivitySquare size={20} />}
          label="CONVERSION RATE"
          value={`${stats.conversion_rate_percentage}%`}
          trend={{ value: "3.00%", isPositive: true }}
        />
      </div>
    </div>
  );
}
