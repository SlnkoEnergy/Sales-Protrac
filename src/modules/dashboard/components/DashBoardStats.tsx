import { useEffect, useState } from "react";
import { Banknote, User, BadgePercent, ActivitySquare } from "lucide-react";
import StatCard from "@/components/ui/statrCard";
import { getSummary } from "@/services/leads/Dashboard";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";
import { format, differenceInDays } from "date-fns";

export default function DashboardStats() {
  const { dateRange } = useDateFilter();
  const [stats, setStats] = useState({
    total_leads: 0,
    previous_total_leads: 0,
    conversion_rate_percentage: 0,
    previous_conversion_rate_percentage: 0,
    assigned_tasks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
        const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");

        const daysDiff = differenceInDays(dateRange[0].endDate, dateRange[0].startDate) + 1;

        const prevEndDate = new Date(dateRange[0].startDate);
        prevEndDate.setDate(prevEndDate.getDate() - 1);

        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setDate(prevStartDate.getDate() - daysDiff + 1);

        const prevStart = format(prevStartDate, "yyyy-MM-dd");
        const prevEnd = format(prevEndDate, "yyyy-MM-dd");

    
        const currentData = await getSummary({ startDate, endDate });
        const prevData = await getSummary({ startDate: prevStart, endDate: prevEnd });

        setStats({
          total_leads: currentData.total_leads ?? 0,
          previous_total_leads: prevData.total_leads ?? 0,
          conversion_rate_percentage: currentData.conversion_rate_percentage ?? 0,
          previous_conversion_rate_percentage: prevData.conversion_rate_percentage ?? 0,
          assigned_tasks: currentData.assigned_tasks ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, [dateRange]);

 
  const calculateLeadsTrend = () => {
    const { total_leads, previous_total_leads } = stats;
    if (previous_total_leads === 0) return 0;
    const diff = total_leads - previous_total_leads;
    return ((diff / previous_total_leads) * 100).toFixed(2);
  };

  const leadsTrendValue = calculateLeadsTrend();
  const isLeadsTrendPositive = leadsTrendValue >= 0;

 
  const calculateConversionTrend = () => {
    const { conversion_rate_percentage, previous_conversion_rate_percentage } = stats;
    if (previous_conversion_rate_percentage === 0) return 0;
    const diff = conversion_rate_percentage - previous_conversion_rate_percentage;
    return ((diff / previous_conversion_rate_percentage) * 100).toFixed(2);
  };

  const conversionTrendValue = calculateConversionTrend();
  const isConversionTrendPositive = conversionTrendValue >= 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={<Banknote size={20} />}
          label="TOTAL SALES"
          value="UGX. 30M"
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
          trend={{
            value: `${Math.abs(leadsTrendValue)}%`,
            isPositive: isLeadsTrendPositive,
          }}
        />
        <StatCard
          icon={<ActivitySquare size={20} />}
          label="CONVERSION RATE"
          value={`${stats.conversion_rate_percentage}%`}
          trend={{
            value: `${Math.abs(conversionTrendValue)}%`,
            isPositive: isConversionTrendPositive,
          }}
        />
      </div>
    </div>
  );
}
