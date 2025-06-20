import Header from "@/components/layout/Header";
import Chart from "@/components/ui/lineChart";
import LineChart from "@/components/ui/lineChart";
import BrowserVisitorPieChart from "@/components/ui/piechart";
import ChartAreaInteractive from "@/components/ui/interactiveChart"
import ChartAreaInteractiveRadar from "@/components/ui/ChartAreaInteractiveRadar";
import SearchBar from "@/components/layout/SearchBar";
import DashboardStats from "@/components/DashBoardStats";
import TeamAvailability from "@/components/TeamAvailability";
import ChartPieDonutText from "@/components/ui/leadStatus";
import FunnelChart from "@/components/ui/funnelChart";
// import LeadsStatusCard from "@/components/ui/leadStatus";


export default function Dashboard() {
  return (
    <>
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
    </>
  );
}
