import { useEffect, useState } from "react";
import { Banknote, User, BadgePercent, ActivitySquare } from "lucide-react";
import StatCard from "@/components/ui/statrCard";
import { getSummary } from "@/services/leads/Dashboard";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";
import { format } from "date-fns";

export default function DashboardStats() {
  const { dateRange } = useDateFilter();
  const [stats, setStats] = useState({
    total_leads: 0,
    total_leads_change_percentage: 0,
    conversion_rate_percentage: 0,
    conversion_rate_change_percentage: 0,
    assigned_tasks: 0,
    assigned_tasks_change_percentage: 0,
    amount_earned: 0,
    amount_earned_change_percentage: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
        const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");

        const data = await getSummary({ startDate, endDate });

        setStats({
          total_leads: data.total_leads ?? 0,
          total_leads_change_percentage: data.total_leads_change_percentage ?? 0,
          conversion_rate_percentage: data.conversion_rate_percentage ?? 0,
          conversion_rate_change_percentage: data.conversion_rate_change_percentage ?? 0,
          assigned_tasks: data.total_assigned_tasks ?? 0,
          assigned_tasks_change_percentage: data.total_assigned_tasks_change_percentage ?? 0,
          amount_earned: data.amount_earned ?? 0,
          amount_earned_change_percentage: data.amount_earned_change_percentage ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, [dateRange]);

  console.log(stats);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <StatCard
          icon={<Banknote size={20} />}
          label="TOTAL SALES"
          value={`₹ ${stats.amount_earned} Cr`}
          trend={{
            value: `${Math.abs(stats.amount_earned_change_percentage).toFixed(2)}%`,
            isPositive: stats.amount_earned_change_percentage >= 0,
          }}
        />

        <StatCard
          icon={<User size={20} />}
          label="ASSIGNED TASKS"
          value={stats.assigned_tasks.toString()}
          trend={{
            value: `${Math.abs(stats.assigned_tasks_change_percentage).toFixed(2)}%`,
            isPositive: stats.assigned_tasks_change_percentage >= 0,
          }}
        />

        <StatCard
          icon={<BadgePercent size={20} />}
          label="TOTAL LEADS"
          value={stats.total_leads.toString()}
          trend={{
            value: `${Math.abs(stats.total_leads_change_percentage).toFixed(2)}%`,
            isPositive: stats.total_leads_change_percentage >= 0,
          }}
        />

        <StatCard
          icon={<ActivitySquare size={20} />}
          label="CONVERSION RATE"
          value={`${stats.conversion_rate_percentage.toFixed(2)}%`}
          trend={{
            value: `${Math.abs(stats.conversion_rate_change_percentage).toFixed(2)}%`,
            isPositive: stats.conversion_rate_change_percentage >= 0,
          }}
        />
        
      </div>
    </div>
  );
}
