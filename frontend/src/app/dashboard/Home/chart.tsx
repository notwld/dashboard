import * as React from "react"
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, RadarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
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
                    <CardTitle>Status Analysis</CardTitle>
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
                                {key}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                ${(total[key] || 0).toLocaleString()}
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
    type Client = {
        client: string;
        totalCredits: string;
        deals: string;
    };
    const clients = leads.reduce((acc, lead) => {
        const { name: client, status, credits } = lead;
        const amount = parseInt(credits, 10) || 0;

        if (client && status === "Paid") {
            if (!acc[client]) {
                acc[client] = { client: client, totalCredits: 0, deals: 0 };
            }
            acc[client].totalCredits += amount;
            acc[client].deals += 1; // Increment deals count for each completed deal
        }
        return acc;
    }, {});
    console.log(clients)

    return (
        <Card className="flex flex-col">
            <CardHeader className=" pb-0">
                <CardTitle className="text-3xl">Deals Closed</CardTitle>
                <CardDescription className="text-[16px]">Clients who paid</CardDescription>
            </CardHeader>
            <CardContent className="">
                <ScrollArea className="h-[290px] w-full">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="text-[18px]">
                                <TableHead>Client</TableHead>
                                <TableHead>Deals</TableHead>
                                <TableHead>Total Credits</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="w-full">
                            {Object.values(clients).map((client: Client, index: Number) => (
                                <TableRow className="text-[18px]" key={index}>
                                    <TableCell>{client.client}</TableCell>
                                    <TableCell>{client.deals}</TableCell>
                                    <TableCell>${client.totalCredits}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>

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
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/Table/table";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Sidebar/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { DialogHeader } from "../../../components/ui/Modal/dialog";
import { Label } from "../../../components/ui/Sidebar/label";
import { Progress } from "../../../components/progress";
function SalesChart({ leads }) {
    const [monthlySales, setMonthlySales] = React.useState([]);
    const [currentMonthSales, setCurrentMonthSales] = React.useState(0);
    const [goal, setGoal] = React.useState(1000)

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
    const [progress, setProgress] = React.useState(0)
    const handleGoal = () => {
        localStorage.setItem('goal', goal)
        const progress = (parseFloat(currentMonthSales) / parseFloat(goal)) * 100
        setProgress(progress.toFixed(1))
    }
    React.useEffect(() => {
        const goal = localStorage.getItem('goal')
        if (goal) {
            const progress = (parseFloat(currentMonthSales) / parseFloat(goal)) * 100
            setProgress(progress.toFixed(1))
        }

    }, [monthlySales])
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="pb-1 text-3xl">Monthly Sales Chart</CardTitle>
                        <CardDescription>
                           <span className="text-[18px]">
                           ${currentMonthSales.toLocaleString()} (goal ${goal}) earned this month 
                           </span>
                            <div className="flex gap-2 w-[550px] mt-1">
                                <Progress value={progress >= 100 ? 100 : progress} />
                                <span className="w-full text-[16px]">
                                     {progress >= 100 ? 'completed' : `${progress} % to goal`}
                                </span>
                            </div>
                        </CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="text-xl">Set Goal</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Set Goal</DialogTitle>
                                <DialogDescription>
                                    Set a monthly sales goal to track your progress
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Goal
                                    </Label>
                                    <Input
                                        id="name"
                                        defaultValue="1000"
                                        className="col-span-3"
                                        onChange={(e) => setGoal(e.target.value)}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>

                                    <Button type="submit" onClick={() => handleGoal()}>Save changes</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer className="h-[40vh] w-[81vw]" config={chartConfig}>
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
                            className="text-lg "
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value / 1000}k`}
                            className="text-lg"
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

function Status({ leads }) {
    // Generate the chart data with counts for each status
    const chartData = Object.values(
        leads.reduce((acc, lead) => {
            const { status } = lead;
            if (status) {
                if (!acc[status]) {
                    acc[status] = { status: status, count: 0 };
                }
                acc[status].count += 1;
            }
            return acc;
        }, {})
    );

    return (
        <Card >
            <CardHeader>
                <CardTitle className="text-3xl">Pipeline</CardTitle>
                <CardDescription className="text-[16px]">Leads by Status</CardDescription>
            </CardHeader>
            <CardContent >
                <ChartContainer config={chartConfig}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ right: 16 }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="status"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            className="text-[9.5px]"
                        />
                        <XAxis dataKey="count" type="number" />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="count"
                            layout="vertical"
                            fill="#8884d8"
                            radius={4}
                        >
                            {/* <LabelList
                                dataKey="status"
                                position="insideLeft"
                                offset={8}
                                className="fill-foreground"
                                fontSize={10}
                            />
                            */}
                            <LabelList
                                dataKey="count"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
export { Chart1, TopPayingCustomersChart, TopServicesChart, SalesChart, Status }