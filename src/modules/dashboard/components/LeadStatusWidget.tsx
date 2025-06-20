"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import { DateRange } from "react-date-range";
import { subDays, subMonths, subYears, startOfDay } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getLeadSummary } from "@/services/leads/dashboard";

const filters = [
  { label: "Today", range: () => [startOfDay(new Date()), new Date()] },
  { label: "1 Week", range: () => [subDays(new Date(), 7), new Date()] },
  { label: "1 Month", range: () => [subMonths(new Date(), 1), new Date()] },
  { label: "3 Months", range: () => [subMonths(new Date(), 3), new Date()] },
  { label: "6 Months", range: () => [subMonths(new Date(), 6), new Date()] },
  { label: "9 Months", range: () => [subMonths(new Date(), 9), new Date()] },
  { label: "1 Year", range: () => [subYears(new Date(), 1), new Date()] },
  { label: "Custom", range: null },
];

export default function LeadStatusWidget() {
  const [selectedFilter, setSelectedFilter] = React.useState("Today");
  const [dateRange, setDateRange] = React.useState([
    {
      startDate: startOfDay(new Date()),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showPicker, setShowPicker] = React.useState(false);
  const [leadData, setLeadData] = React.useState([]);
  const pickerRef = React.useRef<HTMLDivElement | null>(null);

  const fetchLeadStatus = async () => {
    try {
      const data = await getLeadSummary();

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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const handleFilterChange = (label: string) => {
    setSelectedFilter(label);
    if (label === "Custom") {
      setShowPicker(true);
    } else {
      const [startDate, endDate] = filters.find((f) => f.label === label)?.range()!;
      setDateRange([{ startDate, endDate, key: "selection" }]);
      setShowPicker(false);
    }
  };

  const total = leadData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="w-full h-full rounded-2xl border p-4 relative">
      <CardHeader className="flex flex-row justify-between items-center pb-0">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Leads Status
        </CardTitle>
        <div className="relative">
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[130px] h-9 text-sm focus:outline-none ring-1 ring-gray-300">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              {filters.map((f) => (
                <SelectItem key={f.label} value={f.label}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showPicker && (
            <div className="absolute right-0 z-50 mt-2 shadow-xl" ref={pickerRef}>
              <DateRange
                editableDateInputs
                onChange={(item) => setDateRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                maxDate={new Date()}
              />
            </div>
          )}
        </div>
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
        </PieChart>
        </div>

        <div className="text-sm flex flex-col gap-2 col-span-2">
          {leadData.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}</span>
              </div>
              <CardDescription className="text-gray-800 font-medium">{item.value} Leads</CardDescription>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
