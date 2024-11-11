import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, RadarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../../components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../../../components/ui/chart"

const chartConfig = {
    status: {
        label: "Status",
        colors: {
            Paid: "hsl(145, 63%, 42%)", // green
            "Already Hired": "hsl(200, 80%, 50%)", // blue
            "Call back scheduled": "hsl(30, 100%, 50%)", // orange
            Voicemail: "hsl(45, 100%, 51%)", // yellow
            "Wrong number": "hsl(4, 90%, 58%)", // red
            "Number not in service": "hsl(0, 0%, 60%)", // grey
            Refund: "hsl(300, 60%, 60%)", // purple
        }
    },
} satisfies ChartConfig;


function Chart1({ leads }) {
    const [activeChart, setActiveChart] = React.useState("Paid")

    // Process leads data into the format needed for the chart
    const processedChartData = React.useMemo(() => {
        const chartDataMap = {}

        leads.forEach((row) => {
            const { date, status, credits } = row

            // Format date to "YYYY-MM-DD"
            const formattedDate = new Date(date).toISOString().split("T")[0]

            // Initialize unique key for each date-status combination
            const key = `${formattedDate}-${status}`

            // Check if this date-status combination already exists in chartDataMap
            if (!chartDataMap[key]) {
                chartDataMap[key] = { date: formattedDate, status: status, count: 0 }
            }

            // Sum the Credits for this date-status
            chartDataMap[key].count += parseInt(credits, 10) || 0
        })

        // Convert the map to an array
        return Object.values(chartDataMap)
    }, [leads])

    // Calculate totals based on processed data
    const total = React.useMemo(() => {
        return processedChartData.reduce(
            (acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + curr.count
                return acc
            },
            {}
        )
    }, [processedChartData])

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>Bar Chart - Status Analysis</CardTitle>
                    <CardDescription>Showing total entries by status</CardDescription>
                </div>
                <div className="flex">
                    {Object.keys(chartConfig.status.colors).map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            onClick={() => setActiveChart(key)}
                        >
                            <span className="text-xs text-muted-foreground">
                                {chartConfig.status.label} - {key}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {(total[key] || 0).toLocaleString()}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={processedChartData.filter((item) => item.status === activeChart)}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="status"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                />
                            }
                        />
                        <Bar dataKey="count" fill={chartConfig.status.colors[activeChart]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}


import { Pie, PieChart } from "recharts"
import { TrendingUp } from "lucide-react";


function TopPayingCustomersChart({ leads }) {
    const chartData = leads.reduce((acc, lead) => {
        const { name, credits } = lead;
        const payment = parseInt(credits, 10) || 0;

        if (name) {
            if (!acc[name]) {
                acc[name] = { name: name, totalPaid: 0 };
            }
            acc[name].totalPaid += payment;
        }
        return acc;
    }, {});

    const sortedData = Object.values(chartData)
        .sort((a, b) => b.totalPaid - a.totalPaid)
        .map((customer, index) => ({
            ...customer,
            fill: `hsl(${(index * 50) % 360}, 70%, 50%)`,
        }));

    // 2. Chart Configuration
    const chartConfig = {
        totalPaid: {
            label: "Total Paid",
        },
    } satisfies ChartConfig;

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Top Paying Customers</CardTitle>
                <CardDescription>Ranking by Total Amount Paid</CardDescription>
            </CardHeader>
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
                        <Pie data={sortedData} dataKey="totalPaid" nameKey="name" />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {/* Trending up by 5.2% this month  */}
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total amount paid by each customer
                </div>
            </CardFooter>
        </Card>
    );

}

import { PolarAngleAxis, PolarGrid, Radar } from "recharts"
import { format, parse } from "date-fns";
import { Tooltip } from "../../../components/ui/Sidebar/tooltip";

function TopServicesChart({ leads }) {
    // 1. Prepare chart data by aggregating total credits per service
    const chartData = Object.values(
        leads.reduce((acc, lead) => {
            const { service, credits } = lead;
            const amount = parseInt(credits, 10) || 0;

            if (service) {
                if (!acc[service]) {
                    acc[service] = { service: service, totalCredits: 0 };
                }
                acc[service].totalCredits += amount;
            }
            return acc;
        }, {})
    ).map((service, index) => ({
        ...service,
        fill: `hsl(${(index * 60) % 360}, 70%, 50%)`, // Dynamic color for each service
    }));

    // 2. Chart Configuration
    const chartConfig = {
        totalCredits: {
            label: "Total Credits",
        },
    } satisfies ChartConfig;

    // 3. Render the chart component
    return (
        <Card>
            <CardHeader className="items-center pb-4">
                <CardTitle>Top Services</CardTitle>
                <CardDescription>Ranked by Total Credits Earned</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadarChart data={chartData}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <PolarGrid gridType="circle" />
                        <PolarAngleAxis dataKey="service" />
                        <Radar
                            dataKey="totalCredits"
                            fill="#8884d8"
                            fillOpacity={0.6}
                            dot={{
                                r: 4,
                                fillOpacity: 1,
                            }}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Top Services by Credits Earned
                </div>
            </CardFooter>
        </Card>
    );
}

import { Area, AreaChart } from "recharts"
function SalesChart({ leads }) {
    const [monthlySales, setMonthlySales] = React.useState([]);
    const [currentMonthSales, setCurrentMonthSales] = React.useState(0);

    React.useEffect(() => {
        // Aggregate sales data by month
        const salesByMonth = {};

        leads.forEach((item) => {
            const date = new Date(item.date);
            const monthKey = date.toISOString().slice(0, 7); // Format as "YYYY-MM"

            // Calculate cumulative sales based on cost
            salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + parseFloat(item.cost);
        });

        // Prepare data for chart
        const chartData = Object.keys(salesByMonth).map((month) => ({
            month: new Date(month).toLocaleString("en-US", { month: "long" }),
            sales: salesByMonth[month],
        }));

        setMonthlySales(chartData);

        // Calculate current month's sales
        const currentMonthKey = new Date().toISOString().slice(0, 7);
        setCurrentMonthSales(salesByMonth[currentMonthKey] || 0);
    }, [leads]);

    const chartConfig = {
        sales: {
            label: "Sales",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Sales Chart</CardTitle>
                <CardDescription>
                    Showing total sales for each month
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={monthlySales}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)} // Short month name
                        />
                        <YAxis 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area
                            dataKey="sales"
                            type="natural"
                            fill="var(--color-sales)"
                            fillOpacity={0.4}
                            stroke="var(--color-sales)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>

        </Card>
    );
}
export { Chart1, TopPayingCustomersChart, TopServicesChart, SalesChart }