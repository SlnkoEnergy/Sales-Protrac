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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format, subDays } from "date-fns";
import { getLeadConversion } from "@/services/leads/dashboard"; // ✅ Your API call

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
  const [selectedRange, setSelectedRange] = React.useState("14d");
  const [chartData, setChartData] = React.useState([]);

  const calculateDateRange = (range: string) => {
    const endDate = new Date();
    let startDate = new Date();
    if (range === "7d") startDate = subDays(endDate, 7);
    else if (range === "14d") startDate = subDays(endDate, 14);
    else if (range === "30d") startDate = subDays(endDate, 30);
    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
    };
  };

  const fetchData = async () => {
    const { start, end } = calculateDateRange(selectedRange);
    try {
      const res = await getLeadConversion(start, end);
      setChartData([
        {
          date: `${start} to ${end}`,
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
  }, [selectedRange]);

  const activeChartKey = "total_leads"; // You can allow toggle between keys if needed

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-2xl">Conversion Rate</CardTitle>
        </div>
        <div className="flex gap-4 items-center p-2">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 2 weeks</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
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
