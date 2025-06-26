"use client";

import { useEffect, useRef } from "react";
import { useDateFilter } from "@/modules/dashboard/components/DateFilterContext";
import { getLeadFunnel } from "@/services/leads/Dashboard";

const FunnelChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { selectedFilter, dateRange } = useDateFilter();

  useEffect(() => {
    const loadFunnel = async () => {
      try {
        const module = await import("d3-funnel");
        const D3Funnel = module.default;

        if (!chartRef.current || !D3Funnel) return;

        const params: Record<string, any> = { range: selectedFilter };
        if (selectedFilter === "Custom") {
          params.startDate = dateRange[0].startDate.toISOString().split("T")[0];
          params.endDate = dateRange[0].endDate.toISOString().split("T")[0];
        }

        const data = await getLeadFunnel(params);

        const funnelData = [
          ["Initial Leads", data.initial?.count ?? 0],
          ["Follow Up", data.followup?.count ?? 0],
          ["Warm Leads", data.warm?.count ?? 0],
          ["Closed Leads", data.won?.count ?? 0],
          ["Dead Leads", data.dead?.count ?? 0],
        ];

        const containerWidth = chartRef.current.offsetWidth;
        const funnelHeight = containerWidth * 0.6; // Keep height proportional

        const funnel = new D3Funnel(chartRef.current);
        funnel.draw(funnelData, {
          chart: {
            width: containerWidth,
            height: funnelHeight,
            bottomPinch: 1,
          },
          block: {
            dynamicHeight: true,
            minHeight: 15,
            highlight: true,
          },
          label: {
            fontSize: "16px",
            fill: "#fff",
          },
          tooltip: {
            enabled: true,
            format: (label, value) => `${label}: ${value}`,
          },
        });
      } catch (err) {
        console.error("❌ Error rendering funnel chart:", err);
      }
    };

    loadFunnel();

    const handleResize = () => {
      loadFunnel();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedFilter, dateRange]);

  return (
    <div className="bg-white rounded-2xl shadow border p-6 w-full overflow-x-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lead Funnel</h2>
      <div ref={chartRef} className="min-h-[400px] w-full" />
    </div>
  );
};

export default FunnelChart;
