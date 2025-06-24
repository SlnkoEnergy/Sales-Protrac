"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
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

import { format } from "date-fns";
import { getLeadConversion } from "@/services/leads/Dashboard";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext"; // ✅ Global filter

const chartConfig = {
  total_leads: {
    label: "Total Leads",
    color: "#4f46e5",
  },
  total_handovers: {
    label: "Handovers",
    color: "#16a34a",
  },
};

export default function ConversionRateChart() {
  const { dateRange } = useDateFilter(); // ✅ Global date range
  const [chartData, setChartData] = React.useState([]);

  const fetchData = async () => {
    try {
      const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
      const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");

      const res = await getLeadConversion({ startDate, endDate });

      setChartData([
        {
          date: `${startDate} to ${endDate}`,
          total_leads: res.total_leads || 0,
          total_handovers: res.total_handovers || 0,
        },
      ]);
    } catch (err) {
      console.error("Failed to fetch lead conversion data", err);
      setChartData([]);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [dateRange]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-2xl">Conversion Rate</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="bg-white p-2 shadow rounded text-sm">
                      <div className="text-xs mb-1 font-medium">{item.payload.date}</div>
                      {payload.map((entry, idx) => (
                        <div key={idx}>
                          {chartConfig[entry.dataKey].label}: {entry.value}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {Object.keys(chartConfig).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig[key].color}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
