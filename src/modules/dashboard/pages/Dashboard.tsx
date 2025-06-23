import Header from "@/components/layout/Header";
import SearchBar from "@/components/layout/SearchBar";
import TeamAvailability from "@/modules/dashboard/components/TeamAvailability";
import LeadStatusWidget from "@/modules/dashboard/components/LeadStatusWidget";
import FunnelChart from "@/modules/dashboard/components/funnelChart";
import DashboardStats from "@/modules/dashboard/components/DashBoardStats";
import ConversionRateChart from "@/modules/dashboard/components/conversionRateChart";
import ChartAreaInteractive from "@/modules/dashboard/components/interactiveChart";
import LeadSourceWidget from "@/modules/dashboard/components/LeadSourceWidget";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SearchBar />
      <div className="p-6 flex flex-col gap-4">
        <DashboardStats />
        <div className="grid grid-cols-2 gap-4">
          <ConversionRateChart />
          <LeadSourceWidget />
          <TeamAvailability />
          <LeadStatusWidget />
          <FunnelChart />
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}
