import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartData = [
  { browser: "Website", visitors: 275, fill: "#3B82F6" },
  { browser: "Directors", visitors: 200, fill: "#10B981" },
  { browser: "Facebook", visitors: 187, fill: "#F59E0B" },
  { browser: "IVR", visitors: 173, fill: "#6366F1" },
  { browser: "Other", visitors: 90, fill: "#9CA3AF" },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function BrowserVisitorPieChart() {
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

        <div className="flex flex-col gap-2 mt-4 text-sm">
          {chartData.map((entry) => (
            <div key={entry.browser} className="flex items-center gap-2">
              <div className="w-5 h-5" style={{ backgroundColor: entry.fill }}></div>
              <span>{entry.browser}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
