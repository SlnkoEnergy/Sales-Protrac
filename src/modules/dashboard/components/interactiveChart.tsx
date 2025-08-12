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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getWonAndLost } from "@/services/leads/Dashboard";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";
import { useNavigate } from "react-router-dom";

export default function SalesOverviewChart() {
  const [chartData, setChartData] = React.useState([]);
  const { dateRange } = useDateFilter();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState([
    { label: "Number of Leads", value: "-" },
    { label: "Active Leads", value: "-" },
    { label: "Closed Leads", value: "-", className: "text-green-600" },
    { label: "Lost Leads", value: "-", className: "text-red-600" },
  ]);

  React.useEffect(() => {
    fetchWonAndLostData();
  }, [dateRange]);

  const fetchWonAndLostData = async () => {
  try {
    const data = await getWonAndLost({
      startDate: dateRange[0].startDate,
      endDate: dateRange[0].endDate,
    });

    setStats([
      { label: "Number of Leads", value: data.total_leads ?? 0 },
      { label: "Active Leads", value: data.active_leads ?? 0 },
      {
        label: "Closed Leads",
        value: data.won_leads ?? 0,
        className: "text-green-600",
      },
      {
        label: "Lost Leads",
        value: data.lost_leads ?? 0,
        className: "text-red-600",
      },
    ]);

    // Use only months from API response
    const formattedChartData = (data.monthly_data ?? []).map((item) => ({
      month: item.month,
      closed: item.won_percentage ?? 0,
      lost: item.lost_percentage ?? 0,
    }));

    setChartData(formattedChartData);
  } catch (error) {
    console.error("Error fetching Won & Lost data:", error);
  }
};

  const handleNavigate = (type: "won" | "dead") => {
    const fromDate = dateRange[0].startDate.toISOString();
    const toDate = dateRange[0].endDate.toISOString();
    navigate(`/leads?stage=${type}&fromDate=${fromDate}&toDate=${toDate}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              className="cursor-pointer"
              onClick={(e) => {
                if (!e?.activePayload?.length) return;
                const keys = e.activePayload.map((p) => p.dataKey);
                if (keys.includes("closed")) {
                  handleNavigate("won");
                } else if (keys.includes("lost")) {
                  handleNavigate("dead");
                }
              }}
            >
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
                    const closed =
                      payload.find((p) => p.dataKey === "closed")?.value ?? 0;
                    const lost =
                      payload.find((p) => p.dataKey === "lost")?.value ?? 0;

                    return (
                      <div
                        className="bg-white p-2 shadow rounded text-sm"
                        style={{ pointerEvents: "auto" }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="font-medium mb-1">{label}</div>
                        <div
                          className="text-green-600 cursor-pointer"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleNavigate("won");
                          }}
                        >
                          Closed: {closed.toFixed(2)}%
                        </div>
                        <div
                          className="text-red-600 cursor-pointer"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleNavigate("dead");
                          }}
                        >
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
