"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getWonAndLost } from "@/services/leads/Dashboard";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";

export default function SalesOverviewChart() {
  const [chartData, setChartData] = React.useState([]);
  const { selectedFilter, dateRange } = useDateFilter();
  
  const [stats, setStats] = React.useState([
    { label: "Number of Leads", value: "-" },
    { label: "Active Leads", value: "-" },
    { label: "Closed Leads", value: "-", className: "text-green-600" },
    { label: "Lost Leads", value: "-", className: "text-red-600" },
  ]);

  React.useEffect(() => {
    fetchWonAndLostData();
  }, [selectedFilter, dateRange]);

  const fetchWonAndLostData = async () => {
    try {
       const params: Record<string, any> = { range: selectedFilter };
        if (selectedFilter) {
          params.startDate = dateRange[0].startDate.toISOString().split("T")[0];
          params.endDate = dateRange[0].endDate.toISOString().split("T")[0];
        }


      const data = await getWonAndLost(params);
      console.log("params", params);
      console.log("",data)

      setStats([
        { label: "Number of Leads", value: data.total_leads ?? 0 },
        { label: "Active Leads", value: data.active_leads ?? 0 },
        { label: "Closed Leads", value: data.won_leads ?? 0, className: "text-green-600" },
        { label: "Lost Leads", value: data.lost_leads ?? 0, className: "text-red-600" },
      ]);

      const allMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const apiDataMap = {};
      (data.monthly_data ?? []).forEach((item) => {
        apiDataMap[item.month] = {
          closed: item.won_percentage ?? 0,
          lost: item.lost_percentage ?? 0,
        };
      });

      const formattedChartData = allMonths.map((month) => ({
        month,
        closed: apiDataMap[month]?.closed ?? 0,
        lost: apiDataMap[month]?.lost ?? 0,
      }));

      setChartData(formattedChartData);
    } catch (error) {
      console.error("Error fetching Won & Lost data:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const closed = payload.find((p) => p.dataKey === "closed")?.value ?? 0;
                    const lost = payload.find((p) => p.dataKey === "lost")?.value ?? 0;

                    return (
                      <div className="bg-white p-2 shadow rounded text-sm">
                        <div className="font-medium mb-1">{label}</div>
                        <div className="text-green-600">
                          Closed: {closed.toFixed(2)}%
                        </div>
                        <div className="text-red-600">
                          Lost: {lost.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="closed"
                stroke="#16a34a"
                fill="url(#colorClosed)"
              />
              <Area
                type="monotone"
                dataKey="lost"
                stroke="#dc2626"
                strokeDasharray="5 5"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-xl font-bold ${item.className || ""}`}>
                {item.value}
              </div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
