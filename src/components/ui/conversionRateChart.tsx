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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartData = [
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#4f46e5",
  },
  mobile: {
    label: "Mobile",
    color: "#16a34a",
  },
};

export default function ConversionRateChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("desktop");
const [selectedRange, setSelectedRange] = React.useState("14d");

  const filteredData = React.useMemo(() => {
    if (selectedRange === "7d") return chartData.slice(-7);
    if (selectedRange === "14d") return chartData.slice(-14);
    return chartData;
  }, [selectedRange]);
  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [filteredData]
  );

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
        <ChartContainer className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData}>

              <XAxis
                dataKey="date"
                tickFormatter={(dateStr) => {
                  const date = new Date(dateStr);
                  return date.toLocaleDateString("en-US", { weekday: "short" });
                }}
                axisLine={true}
                tickLine={false}
                interval={0} // Force all ticks to show
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const item = payload[0];
                  const label = new Date(item.payload.date).toLocaleDateString(
                    "en-US",
                    { weekday: "long", month: "short", day: "numeric" }
                  );
                  return (
                    <div className="bg-white rounded shadow p-2 text-sm">
                      <div className="text-muted-foreground text-xs mb-1">
                        {label}
                      </div>
                      <div className="font-medium text-black">
                        {chartConfig[activeChart].label}: {item.value}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey={activeChart}
                fill="#D9D9D9"
                radius={[100, 100, 0, 0]}
                barSize={20}
                activeBar={{
                  fill: "green",
                  stroke: "green",
                  strokeWidth: 1, // thinner border
                  radius: [100, 100, 0, 0],
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
