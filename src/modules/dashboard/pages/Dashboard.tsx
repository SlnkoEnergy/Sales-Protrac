import Header from "@/components/layout/Header";
import BrowserVisitorPieChart from "@/components/ui/piechart";
import SearchBar from "@/components/layout/SearchBar";
import DashboardStats from "@/modules/dashboard/components/DashBoardStats";
import ConversionRateChart from "@/components/ui/conversionRateChart";

export default function Dashboard() {
  return (
    <>
      <div>
        <Header />
        <SearchBar />
        <DashboardStats />
        <div className="flex flex-col xl:flex-row gap-40 px-6  py-4 w-full h-[400px]">
          <div className="flex-1 h-full">
            <ConversionRateChart />
          </div>
          <div className="flex-1 h-full">
            <BrowserVisitorPieChart />
          </div>
        </div>
      </div>
    </>
  );
}
