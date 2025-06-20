import Header from "@/components/layout/Header";
import BrowserVisitorPieChart from "@/components/ui/piechart";
import SearchBar from "@/components/layout/SearchBar";

import TeamAvailability from "@/modules/dashboard/components/TeamAvailability";
import ChartPieDonutText from "@/modules/dashboard/components/leadStatus";
import FunnelChart from "@/components/ui/funnelChart";
// import LeadsStatusCard from "@/components/ui/leadStatus";

import DashboardStats from "@/modules/dashboard/components/DashBoardStats";
import ConversionRateChart from "@/modules/dashboard/components/conversionRateChart";
import ChartAreaInteractiveRadar from "@/modules/dashboard/components/ChartAreaInteractiveRadar";
import ChartAreaInteractive from "@/components/ui/interactiveChart";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SearchBar />
      <div className="p-6 flex flex-col gap-4">
        <DashboardStats />
        <div className="grid grid-cols-2 gap-4">
          <ConversionRateChart />
          <BrowserVisitorPieChart />
          <TeamAvailability />
          <ChartPieDonutText />
          <FunnelChart />
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}
