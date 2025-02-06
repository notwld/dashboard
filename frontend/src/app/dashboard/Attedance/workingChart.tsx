"use client"

import * as React from "react"
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"


import { Card,CardFooter, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart"
import { Button } from "../../../components/ui/button";

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

export function WorkHoursChart({ checkInTime, isOnBreak, breakHistory }) {
  const workingHoursPerDay = 9;
  const [workedHours, setWorkedHours] = useState(0);
  const remainingHours = Math.max(0, workingHoursPerDay - workedHours);

  useEffect(() => {
    let timer;
    if (checkInTime && !isOnBreak) {
      timer = setInterval(() => {
        const now = new Date();
        const totalWorkedMinutes = (now.getTime() - checkInTime.getTime()) / (1000 * 60);
        const totalBreakMinutes = breakHistory.reduce((acc, curr) => acc + curr.duration, 0);
        setWorkedHours((totalWorkedMinutes - totalBreakMinutes) / 60);
      }, 60000); // Update every minute
    }
    return () => clearInterval(timer);
  }, [checkInTime, isOnBreak, breakHistory]);

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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 24}
                          className="fill-muted-foreground"
                        >
                          Worked Hours
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0)+5}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatTime(workedHours * 60)}
                        </tspan>
                        
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
  );
}
