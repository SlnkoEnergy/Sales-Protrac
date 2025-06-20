"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getTopLeadSources } from "@/services/leads/dashboard.js";

const RADIAN = Math.PI / 180;

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#6366F1", // Indigo
  "#9CA3AF", // Gray
  "#EC4899", // Pink
  "#F87171", // Red
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="600"
      pointerEvents="none"
      style={{ userSelect: "none" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function LeadSourceWidget() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        const data = await getTopLeadSources();

        if (!Array.isArray(data)) {
          console.warn("Unexpected API response format:", data);
          setChartData([]);
          return;
        }

        const formatted = data.map((item, index) => ({
          browser: item.source,
          visitors: item.percentage,
          fill: COLORS[index % COLORS.length],
        }));

        setChartData(formatted);
      } catch (error) {
        console.error("Failed to fetch lead sources:", error);
        setChartData([]);
      }
    };

    fetchLeadSources();
  }, []);

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
                dataKey="visitors"
                nameKey="browser"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={renderCustomizedLabel}
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
              <Tooltip key={entry.browser}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-2 cursor-pointer select-none"
                    aria-label={`${entry.browser}: ${(entry.visitors * 100).toFixed(1)}%`}
                  >
                    <div
                      className="w-6 h-6 rounded shadow-md border border-gray-300 dark:border-gray-700"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {entry.browser}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="text-xs">
                  {`${entry.browser}: ${(entry.visitors * 100).toFixed(1)}%`}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
