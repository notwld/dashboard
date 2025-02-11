"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Card, CardContent } from "../../../../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../../components/ui/chart";

interface AttendanceData {
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

interface AttendanceTodayProps {
  data: AttendanceData | null;
}

export function AttendanceToday({ data }: AttendanceTodayProps) {
  // Default values if data is null
  const attendanceData = [
    { category: "Present", count: data?.presentToday ?? 0, fill: "hsl(var(--chart-1))" },
    { category: "Absent", count: data?.absentToday ?? 0, fill: "hsl(var(--chart-2))" },
    { category: "Late", count: data?.lateToday ?? 0, fill: "hsl(var(--chart-4))" },
  ];

  const chartConfig = {
    present: { label: "Present", color: "hsl(var(--chart-1))" },
    absent: { label: "Absent", color: "hsl(var(--chart-2))" },
    leaves: { label: "Leaves", color: "hsl(var(--chart-3))" },
    late: { label: "Late", color: "hsl(var(--chart-4))" },
  };

  return (
    <Card className="border-none w-full">
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <RadarChart data={attendanceData}>
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar dataKey="count" fill="var(--color-present)" fillOpacity={0.8} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
