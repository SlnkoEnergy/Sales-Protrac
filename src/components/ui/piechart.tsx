"use client";

import React, { useEffect, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTopLeadSources } from "@/services/leads/dashboard.js"; // ✅ Adjust the path if needed

const RADIAN = Math.PI / 180;

// Color palette
const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#6366F1",
  "#9CA3AF",
  "#EC4899",
  "#F87171",
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
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function BrowserVisitorPieChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchLeadSources = async () => {
      try {
        const data = await getTopLeadSources(); // should return array of { source, percentage }

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
    <Card className="flex flex-col">
      <CardHeader className="items-start pb-0">
        <CardTitle className="text-2xl">Top Lead Sources</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {chartData.length > 0 ? (
          <div className="flex flex-col gap-2 mt-4 text-sm">
            {chartData.map((entry) => (
              <div key={entry.browser} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded"
                  style={{ backgroundColor: entry.fill }}
                ></div>
                <span>{entry.browser}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
}
