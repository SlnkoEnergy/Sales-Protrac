"use client";

import { useEffect, useRef } from "react";

const FunnelChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFunnel = async () => {
      try {
        console.log("📦 Importing d3-funnel...");
        const module = await import("d3-funnel");
        const D3Funnel = module.default;

        if (!chartRef.current) {
          console.error("❌ chartRef is not available.");
          return;
        }

        if (!D3Funnel) {
          console.error("❌ D3Funnel is undefined.");
          return;
        }

        const funnel = new D3Funnel(chartRef.current);
        console.log("✅ D3Funnel initialized.");

        const data = {
          label: "Lead Funnel",
          subLabelValue: "percent",
          values: [
            ["Leads", 1400],
            ["Initial Communication", 1212],
            ["Customer Evaluation", 1080],
            ["Negotiation", 665],
            ["Order Received", 578],
            ["Payment", 550],
          ],
        };

        const options = {
          chart: {
            width: 650,
            height: 400,
            bottomPinch: 1,
          },
          block: {
            dynamicHeight: true,
            highlight: true,
          },
          label: {
            fontSize: "16px",
            fill: "#fff",
          },
        };

        funnel.draw(data.values, options);

        console.log("✅ Funnel drawn.");
      } catch (err) {
        console.error("💥 Error rendering funnel:", err);
      }
    };

    loadFunnel();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow border p-6 w-full overflow-x-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lead Funnel</h2>
      <div ref={chartRef} className="min-h-[400px]" />
    </div>
  );
};

export default FunnelChart;
