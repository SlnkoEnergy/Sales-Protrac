import { useEffect, useState } from "react";
import SearchBar from "@/components/layout/SearchBar";
import TeamAvailability from "@/modules/dashboard/components/TeamAvailability";
import LeadStatusWidget from "@/modules/dashboard/components/LeadStatusWidget";
import FunnelChart from "@/modules/dashboard/components/funnelChart";
import DashboardStats from "@/modules/dashboard/components/DashBoardStats";
import ConversionRateChart from "@/modules/dashboard/components/conversionRateChart";
import ChartAreaInteractive from "@/modules/dashboard/components/interactiveChart";
import LeadSourceWidget from "@/modules/dashboard/components/LeadSourceWidget";
import TodoList from "@/modules/dashboard/components/toDoItems";
import Loader from "@/components/loader/loader";


export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-white">
      <SearchBar />
      <div className="p-6 flex flex-col gap-4">
        <DashboardStats />
        <div className="grid grid-cols-2 gap-4">
          <TodoList />
          <ConversionRateChart />
          <LeadSourceWidget />
          <TeamAvailability />
          <LeadStatusWidget />
          <FunnelChart />
        </div>
        <ChartAreaInteractive />
      </div>
    </div>
  );
}
