"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { Card, CardContent } from "../../../../components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../../components/ui/chart"

const attendanceData = [
  { category: "Present", count: 45, fill: "hsl(var(--chart-1))" },
  { category: "Absent", count: 45, fill: "hsl(var(--chart-2))" },
  { category: "Leaves", count: 34, fill: "hsl(var(--chart-3))" },
  { category: "Late", count: 28, fill: "hsl(var(--chart-4))" },
]

const chartConfig = {
  present: { label: "Present", color: "hsl(var(--chart-1))" },
  absent: { label: "Absent", color: "hsl(var(--chart-2))" },
  leaves: { label: "Leaves", color: "hsl(var(--chart-3))" },
  late: { label: "Late", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

export function AttendanceToday() {
  return (
    <Card className="border-none w-full">
     
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="h-[200px] w-full"
        >
          <RadarChart data={attendanceData}>
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              dataKey="count"
              fill="var(--color-present)"
              fillOpacity={0.8}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
  )
}
