import Header from "@/components/layout/Header";
import BrowserVisitorPieChart from "@/components/ui/piechart";
import SearchBar from "@/components/layout/SearchBar";

import TeamAvailability from "@/components/TeamAvailability";
import ChartPieDonutText from "@/components/ui/leadStatus";
import FunnelChart from "@/components/ui/funnelChart";
// import LeadsStatusCard from "@/components/ui/leadStatus";

import DashboardStats from "@/modules/dashboard/components/DashBoardStats";
import ConversionRateChart from "@/components/ui/conversionRateChart";
import ChartAreaInteractiveRadar from "@/components/ui/ChartAreaInteractiveRadar";
import ChartAreaInteractive from "@/components/ui/interactiveChart";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SearchBar />
      <DashboardStats />

      {/* Charts Row - Responsive and non-overlapping */}
      <div className="flex flex-col xl:flex-row gap-6 px-6 py-4 w-full">
        {/* Left Card */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <ConversionRateChart />
        </div>

        {/* Right Card */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <BrowserVisitorPieChart />
        </div>
      </div>

      {/* Team Availability + Lead Status Row */}
      <div className="flex flex-col xl:flex-row gap-6 px-6 py-4 w-full">
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <TeamAvailability />
        </div>
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <ChartPieDonutText />
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="px-6 py-4">
        <FunnelChart />
      </div>
      <ChartAreaInteractive/>
    </div>
  );
}

