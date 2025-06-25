"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Label, Tooltip as RechartsTooltip } from "recharts";

import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { getLeadSummary } from "@/services/leads/Dashboard";

export default function LeadStatusWidget() {
  const { dateRange } = useDateFilter();
  const [leadData, setLeadData] = React.useState([]);

  const fetchLeadStatus = async () => {
    try {
      const data = await getLeadSummary({
        startDate: dateRange[0].startDate,
        endDate: dateRange[0].endDate,
      });

      const mapped = [
        { name: "Initial Leads", value: data.initial_leads, color: "#FF9500" },
        { name: "Follow Up Leads", value: data.followup_leads, color: "#FFD700" },
        { name: "Warm Leads", value: data.warm_leads, color: "#4CD964" },
        { name: "Closed Leads", value: data.won_leads, color: "#0084FF" },
        { name: "Dead Leads", value: data.dead_leads, color: "#FF3B30" },
      ];

      setLeadData(mapped);
    } catch (err) {
      console.error("Error fetching lead summary", err);
      setLeadData([]);
    }
  };

  React.useEffect(() => {
    fetchLeadStatus();
  }, [dateRange]);

  const total = leadData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="w-full h-full rounded-2xl border p-4 relative">
      <CardHeader className="flex flex-row justify-between items-center pb-0">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Leads Status
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-5 items-center justify-center pt-4">
        <div className="col-span-3">
          <PieChart width={280} height={280}>
            <Pie
              data={leadData}
              dataKey="value"
              nameKey="name"
              innerRadius={90}
              outerRadius={120}
              stroke="none"
            >
              {leadData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                position="center"
                content={({ viewBox }) => {
                  const { cx, cy }: any = viewBox;
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

            {/* ✅ Recharts Tooltip Applied */}
            <RechartsTooltip
              formatter={(value: number, name: string) => [`${value} Leads`, name]}
            />
          </PieChart>
        </div>

        <div className="text-sm flex flex-col gap-2 col-span-2">
          {leadData.map((item, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}</span>
              </div>
              <CardDescription className="text-gray-800 font-medium">
                {item.value} Leads
              </CardDescription>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
