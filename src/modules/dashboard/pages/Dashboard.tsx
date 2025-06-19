import HomeChart from "@/components/HomeChart";
import Header from "@/components/layout/Header";
import Chart from "@/components/ui/lineChart";
import LineChart from "@/components/ui/lineChart";
import BrowserVisitorPieChart from "@/components/ui/piechart";
import ChartAreaInteractive from "@/components/ui/interactiveChart"
import ChartAreaInteractiveRadar from "@/components/ui/ChartAreaInteractiveRadar";

export default function Dashboard() {
  return (
    <>
    <div>
    <Header />
    <HomeChart />
    <BrowserVisitorPieChart />
    <ChartAreaInteractive/>
    <Chart />
    <ChartAreaInteractiveRadar />
    </div>
    </>
  );
}
