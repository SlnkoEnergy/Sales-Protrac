"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTopLeadSources } from "@/services/leads/Dashboard.js";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext"; // ✅ import global date filter
import { format } from "date-fns";

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#6366F1", // Indigo
  "#9CA3AF", // Gray
  "#EC4899", // Pink
  "#F87171", // Red
];

export default function LeadSourceWidget() {
  const { dateRange } = useDateFilter(); // ✅ hook
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
        const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");

        const data = await getTopLeadSources({ startDate, endDate });

        if (!Array.isArray(data)) {
          console.warn("Unexpected API response format:", data);
          setChartData([]);
          return;
        }

        const formatted = data.map((item, index) => ({
          label: item.source,
          value: item.percentage,
          fill: COLORS[index % COLORS.length],
        }));

        setChartData(formatted);
      } catch (error) {
        console.error("Failed to fetch lead sources:", error);
        setChartData([]);
      }
    };

    fetchLeadSources();
  }, [dateRange]); // ✅ refetch on filter change

  return (
    <Card className="flex flex-col p-6">
      <CardHeader className="items-start pb-2">
        <CardTitle className="text-2xl font-semibold text-[#1f487c]">
          Top Lead Sources
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        <div className="w-full h-[250px] max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ value }) => `${value}%`}
                cursor="pointer"
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {chartData.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4 max-w-md">
            {chartData.map((entry) => (
              <Tooltip key={entry.label}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-2 cursor-pointer select-none"
                    aria-label={`${entry.label}: ${entry.value}%`}
                  >
                    <div
                      className="w-6 h-6 rounded shadow-md border border-gray-300"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {entry.label}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="text-xs">
                  {`${entry.label}: ${entry.value}%`}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}
