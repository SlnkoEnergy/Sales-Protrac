import Header from "@/components/layout/Header";
import BrowserVisitorPieChart from "@/components/ui/piechart";
import SearchBar from "@/components/layout/SearchBar";
<<<<<<< HEAD
import DashboardStats from "@/components/DashBoardStats";
import TeamAvailability from "@/components/TeamAvailability";
import ChartPieDonutText from "@/components/ui/leadStatus";
import FunnelChart from "@/components/ui/funnelChart";
// import LeadsStatusCard from "@/components/ui/leadStatus";

=======
import DashboardStats from "@/modules/dashboard/components/DashBoardStats";
import ConversionRateChart from "@/components/ui/conversionRateChart";
>>>>>>> f001b5d55eb71a34a7d62a593f5e383f372de1d3

export default function Dashboard() {
  return (
    <>
<<<<<<< HEAD
    <div>
    <Header />
    <SearchBar />
     <DashboardStats />
       <div className="flex gap-6 p-6 justify-between items-start w-full">
  {/* Left Component – 50% */}
  <div className="w-1/2">
    <TeamAvailability />
  </div>

  {/* Right Component – 50% */}
  <div className="w-1/2">
    <ChartPieDonutText />
  </div>
</div>

    <FunnelChart/>
     
     
     
     {/* <LeadsStatusCard/> */}
    
    {/* <BrowserVisitorPieChart /> */}
    {/* <ChartAreaInteractive/> */}
    {/* <Chart /> */}
    {/* <ChartAreaInteractiveRadar />  */}
    </div>
=======
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
>>>>>>> f001b5d55eb71a34a7d62a593f5e383f372de1d3
    </>
  );
}
