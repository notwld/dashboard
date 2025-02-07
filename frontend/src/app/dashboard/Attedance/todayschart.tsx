"use client"

import * as React from "react"
import { Pie, PieChart, Label } from "recharts"
import { Card, CardContent } from "../../../components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart"

const workedMinutes = 450  
const totalMinutes = 540

const workedHours = Math.floor(workedMinutes / 60)
const workedMins = workedMinutes % 60

const chartData = [
  { name: "Worked", value: workedMinutes, fill: "hsl(var(--chart-1))" },
  { name: "Remaining", value: totalMinutes - workedMinutes, fill: "hsl(var(--chart-2))" }
]

export function Todays() {
  return (
    <Card className="flex flex-col border-0 shadow-lg">
      <CardContent className="flex-1 pb-0">
        <ChartContainer className="mx-auto aspect-square max-h-[220px]"
          config={{
            worked: { label: "Worked Hours", color: "hsl(var(--chart-1))" },
            remaining: { label: "Remaining Hours", color: "hsl(var(--chart-2))" }
          } as ChartConfig}
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}  
              outerRadius={80}  
              strokeWidth={3}   
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
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {workedHours}h {workedMins}m
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground"
                        >
                          out of {Math.floor(totalMinutes / 60)}h
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
