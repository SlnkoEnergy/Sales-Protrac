// Chart-related exports
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export interface ChartConfig {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

function ChartContainer({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("w-full h-[300px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function ChartLegend() {
  return <Legend />;
}

function ChartLegendContent({ payload }: any) {
  return (
    <ul className="flex gap-4">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="text-sm">
          <span className="mr-2" style={{ color: entry.color }}>
            ●
          </span>
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-background p-2 shadow-sm">
        <p className="font-semibold">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-sm">
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

function ChartTooltipContent({ payload }: { payload?: any[] }) {
  return (
    <div className="text-sm space-y-1">
      {payload?.map((item, index) => (
        <div key={index}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  );
}

// Export chart components
export {

  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};
