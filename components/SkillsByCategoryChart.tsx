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

interface CategoryData {
  name: string;
  count: number;
}

interface SkillsByCategoryChartProps {
  data: CategoryData[];
}

// Define a list of attractive colors for the bars
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#0088FE",
  "#AF19FF",
];

export default function SkillsByCategoryChart({
  data,
}: SkillsByCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-10">
        No category data to display.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 20, // Adjusted right margin for better label visibility if needed
          left: -10, // Adjusted left margin if Y-axis labels are short
          bottom: 5,
        }}
        barGap={10} // Space between bars of the same group (not applicable for single bar)
        barCategoryGap="20%" // Space between categories of bars
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
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
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
