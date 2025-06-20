"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { PieChart, Pie, Label } from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const leadData = [
  { name: "Closed Leads", value: 60, color: "#0084FF" },
  { name: "Warm Leads", value: 20, color: "#4CD964" },
  { name: "Lost", value: 5, color: "#FF3B30" },
  { name: "Yet to Start", value: 5, color: "#FF9500" },
];

export default function LeadsStatusCard() {
  const total = leadData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="w-full h-full rounded-2xl">
      <CardHeader className="flex flex-row justify-between items-center pb-0">
        <CardTitle className="text-base">Leads Status</CardTitle>
        <div className="flex items-center text-sm text-blue-600 font-medium cursor-pointer">
          Today <ChevronDown className="w-4 h-4 ml-1" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center h-full pt-2">
        {/* Chart */}
        <PieChart width={280} height={280}>
          <Pie
            data={leadData}
            dataKey="value"
            nameKey="name"
            innerRadius={90}
            outerRadius={120}
            stroke="none"
          >
            <Label
              position="center"
              content={({ viewBox }) => {
                const { cx, cy } = viewBox;
                return (
                  <>
                    <text
                      x={cx}
                      y={cy - 5}
                      textAnchor="middle"
                      className="text-[26px] font-semibold fill-black"
                    >
                      {total}
                    </text>
                    <text
                      x={cx}
                      y={cy + 18}
                      textAnchor="middle"
                      className="text-sm fill-gray-500"
                    >
                      Total Leads
                    </text>
                  </>
                );
              }}
            />
          </Pie>
        </PieChart>

        {/* Legend */}
        <div className="mt-6 w-full px-6 space-y-3 text-sm">
          {leadData.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="text-gray-800 font-medium">{item.value} Leads</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
