"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ProgressData {
  name: string; // e.g., '0-25%', '26-50%'
  count: number;
}

interface ProgressDistributionChartProps {
  data: ProgressData[];
}

const COLORS = ["#FF8042", "#FFBB28", "#82ca9d", "#8884d8"]; // Different color set for this chart

export default function ProgressDistributionChart({
  data,
}: ProgressDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        No progress data to display.
      </p>
    );
  }

  // Ensure all progress ranges are present, even if count is 0, for consistent chart display
  const completeData = [
    { name: "0-25%", count: 0 },
    { name: "26-50%", count: 0 },
    { name: "51-75%", count: 0 },
    { name: "76-100%", count: 0 },
  ].map((defaultRange) => {
    const foundRange = data.find((d) => d.name === defaultRange.name);
    return foundRange || defaultRange;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={completeData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: "rgba(206, 206, 206, 0.2)" }}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <Bar dataKey="count" name="Skills" unit="">
          {completeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
