"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartData = [
  { month: "Jan", closed: 45, lost: 28 },
  { month: "Feb", closed: 64, lost: 23 },
  { month: "Mar", closed: 54, lost: 43 },
  { month: "Apr", closed: 74, lost: 30 },
  { month: "May", closed: 44, lost: 24 },
  { month: "Jun", closed: 54, lost: 33 },
  { month: "Jul", closed: 39, lost: 18 },
  { month: "Aug", closed: 59, lost: 42 },
  { month: "Sep", closed: 74, lost: 33 },
  { month: "Oct", closed: 46, lost: 20 },
  { month: "Nov", closed: 49, lost: 31 },
  { month: "Dec", closed: 43, lost: 19 },
];

const stats = [
  { label: "Number of Leads", value: "12,721" },
  { label: "Active Leads", value: "721" },
  { label: "Closed Leads", value: "460", className: "text-green-600" },
  { label: "Lost Leads", value: "120", className: "text-red-600" },
];

export default function SalesOverviewChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Increased height */}
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
              <YAxis domain={[0, 100]} />
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

        {/* Added more spacing */}
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
