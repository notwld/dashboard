"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
} from "../../../components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

const chartConfig = {
  worked: {
    label: "Worked Hours",
    color: "hsl(var(--chart-1))",
  },
  remaining: {
    label: "Remaining Hours",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function WorkHoursChart({ checkInTime, isOnBreak, breakHistory = [] }) {
  const workingHoursPerDay = 9;
  const [workedHours, setWorkedHours] = useState(0);

  useEffect(() => {
    if (!checkInTime) {
      setWorkedHours(0);
      return;
    }

    const updateWorkedHours = () => {
      const now = new Date();
      let totalWorkedMinutes = (now - new Date(checkInTime)) / (1000 * 60);

      // Calculate total break time (only if both start & end exist)
      let totalBreakMinutes = breakHistory.reduce((acc, breakEntry) => {
        if (breakEntry?.start && breakEntry?.end) {
          return acc + (new Date(breakEntry.end) - new Date(breakEntry.start)) / (1000 * 60);
        }
        return acc;
      }, 0);

      let finalWorkedHours = (totalWorkedMinutes - totalBreakMinutes) / 60;
      setWorkedHours(Math.max(0, finalWorkedHours)); // Ensure it doesn't go negative
    };

    updateWorkedHours(); // Initial calculation
    const timer = setInterval(updateWorkedHours, 60000); // Update every minute

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [checkInTime, isOnBreak, breakHistory]);

  const remainingHours = Math.max(0, workingHoursPerDay - workedHours);

  const chartData = [
    { name: "Worked", value: workedHours, fill: "var(--color-worked)" },
    { name: "Remaining", value: remainingHours, fill: "var(--color-remaining)" },
  ];

  return (
    <Card className="flex flex-col border-0 shadow-lg">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={80} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 24} className="fill-muted-foreground">
                          Worked Hours
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 5} className="fill-foreground text-3xl font-bold">
                          {formatTime(workedHours * 60)}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
