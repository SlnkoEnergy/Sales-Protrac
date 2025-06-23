"use client";

import { useEffect, useRef } from "react";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";
import { getLeadFunnel } from "@/services/leads/dashboard";

const FunnelChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { selectedFilter, dateRange } = useDateFilter();

  useEffect(() => {
    const loadFunnel = async () => {
      try {
        const module = await import("d3-funnel");
        const D3Funnel = module.default;

        if (!chartRef.current || !D3Funnel) return;

        // ✅ Build query params
        const params: Record<string, any> = { range: selectedFilter };
        if (selectedFilter === "Custom") {
          params.startDate = dateRange[0].startDate.toISOString().split("T")[0];
          params.endDate = dateRange[0].endDate.toISOString().split("T")[0];
        }

        const data = await getLeadFunnel(params);

        // ✅ Always show all steps (even if count is 0)
        const funnelData = [
          ["Initial Leads", data.initial?.count ?? 0],
          ["Follow Up", data.followup?.count ?? 0],
          ["Warm Leads", data.warm?.count ?? 0],
          ["Closed Leads", data.won?.count ?? 0],
          ["Dead Leads", data.dead?.count ?? 0],
          ["Payments", data.payment ?? 0],
        ];

        const funnel = new D3Funnel(chartRef.current);
        funnel.draw(funnelData, {
          chart: {
            width: 650,
            height: 400,
            bottomPinch: 1,
          },
          block: {
            dynamicHeight: true,
            minHeight: 15, // ✅ Enforce visibility even for small/zero values
            highlight: true,
          },
          label: {
            fontSize: "16px",
            fill: "#fff",
          },
        });
      } catch (err) {
        console.error("❌ Error rendering funnel chart:", err);
      }
    };

    loadFunnel();
  }, [selectedFilter, dateRange]);

  return (
    <div className="bg-white rounded-2xl shadow border p-6 w-full overflow-x-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lead Funnel</h2>
      <div ref={chartRef} className="min-h-[400px]" />
    </div>
  );
};

export default FunnelChart;
