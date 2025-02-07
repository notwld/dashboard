"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent } from "../../../../components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "../../../../components/ui/chart"

const departmentData = [
  { department: "HR", employees: 30 },
  { department: "IT", employees: 60 },
  { department: "Sales", employees: 45 },
  { department: "Finance", employees: 40 },
  { department: "SWE", employees: 40 },
]

const chartConfig = {
  employees: { label: "Employees", color: "#6B46C1" }, // Purple color
} satisfies ChartConfig

export function EmployeesByDepartment() {
  return (
    <Card className="border-none w-[50vw]">
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={departmentData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="department" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis allowDecimals={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="employees" fill="#6B46C1" radius={8} /> {/* Purple bar color */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
