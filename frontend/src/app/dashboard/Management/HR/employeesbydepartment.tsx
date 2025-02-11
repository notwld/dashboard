
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent } from "../../../../components/ui/card";
import { ChartContainer, ChartTooltipContent } from "../../../../components/ui/chart";
import { baseurl } from "../../../../config/baseurl";

interface User {
  id: number;
  name: string;
  email: string;
  department?: string | null;
}
const chartConfig = {
  employees: { label: "Employees", color: "#6B46C1" }, // Purple color
} satisfies ChartConfig


export function EmployeesByDepartment() {
  const [departmentData, setDepartmentData] = useState<{ department: string; employees: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseurl}/user/get-users`, {
          method: "GET",
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.statusText}`);
        }

        const users: User[] | null = await res.json();

        if (!users || !Array.isArray(users)) {
          throw new Error("Invalid API response");
        }

        // Process data: count employees per department
        const departmentCount: Record<string, number> = {};
        users.forEach((user) => {
          const dept = user.department ?? "Unknown"; // Handle null values
          departmentCount[dept] = (departmentCount[dept] || 0) + 1;
        });

        // Convert to array format required by Recharts
        const chartData = Object.entries(departmentCount).map(([department, employees]) => ({
          department,
          employees,
        }));

        setDepartmentData(chartData);
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="border-none w-full h-36">
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : departmentData.length === 0 ? (
          <p>No data available</p>
        ) : (
          <ChartContainer  config={chartConfig} className="h-36 w-full">
            <BarChart data={departmentData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="department" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="employees" fill="#6B46C1" radius={8} /> {/* Purple bar color */}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
