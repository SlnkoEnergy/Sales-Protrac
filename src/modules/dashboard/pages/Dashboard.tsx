import Header from "@/components/layout/Header";
import Chart from "@/components/ui/lineChart";
import LineChart from "@/components/ui/lineChart";
import BrowserVisitorPieChart from "@/components/ui/piechart";
import ChartAreaInteractive from "@/components/ui/interactiveChart"
import ChartAreaInteractiveRadar from "@/components/ui/ChartAreaInteractiveRadar";
import SearchBar from "@/components/layout/SearchBar";
import DashboardStats from "@/components/DashBoardStats";

export default function Dashboard() {
  return (
    <>
    <div>
    <Header />
    <SearchBar />
     <DashboardStats />
    <BrowserVisitorPieChart />
    <ChartAreaInteractive/>
    <Chart />
    <ChartAreaInteractiveRadar /> 
    </div>
    </>
  );
}
