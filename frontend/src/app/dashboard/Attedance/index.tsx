import React from 'react'
import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export default function Attendance() {
    // Static attendance data
    const attendanceData = {
        '2025-01-01': 'present',
        '2025-01-02': 'present',
        '2025-01-03': 'present',
        '2025-01-04': 'present',
        '2025-01-05': 'absent',
        '2025-01-10': 'present',
        '2025-01-15': 'absent',
        '2025-01-20': 'present',
        '2025-01-25': 'present',
    };

    // Generate dates for the current month
    const currentMonth = new Date();
    const dates = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Static attendance data

    // Helper to generate calendar data for a month
    const generateCalendar = (year, month) => {
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
    };

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Dates for the current month
    const currentMonthDates = generateCalendar(currentYear, currentMonth);

    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem className='flex w-full justify-between items-center'>
                                <BreadcrumbPage className="flex justify-between items-center text-lg w-full">
                                    <div>

                                        <span className="text-lg font-semibold">Attendance</span>
                                    </div>

                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col items-center gap-4 justify-center">
                    <CheckCircle className="h-64 w-64 text-green-500" />
                    <span className="ml-2 text-lg font-semibold">
                        Today's Attendance has been marked!
                    </span>
                </div>
            </div>
            <div>
                <div className="flex my-10 items-center justify-center bg-gray-800 rounded-xl mx-4 py-5">
                    <span className="text-2xl font-bold text-center">
                        Attendance for January 2025
                    </span>
                </div>
                <Card className="mx-4">
                    <CardHeader>
                        <CardTitle>
                            <div className="grid grid-cols-7 gap-2">
                                {dayNames.map((day) => (
                                    <div key={day} className="text-center">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="">
                        <div className="grid grid-cols-7 gap-2">
                            {dates.map((date) => {
                                const formattedDate = format(date, 'yyyy-MM-dd');
                                const attendance = attendanceData[formattedDate];
                                return (
                                    <div
                                        key={formattedDate}
                                        className={`text-center py-4 rounded-lg ${attendance === 'present'
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                            }`}
                                    >
                                        <span className="font-semibold text-xl">
                                            {format(date, 'dd')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="p-4">
                <h2 className="text-xl font-bold text-center my-6">Yearly Attendance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 12 }).map((_, monthIndex) => {
                        const dates = generateCalendar(currentYear, monthIndex);
                        const monthName = format(new Date(currentYear, monthIndex), "MMMM yyyy");
                        return (
                            <div key={monthIndex} className="p-2">
                                <div className="flex my-4 items-center justify-center bg-gray-800 rounded-xl py-2">
                                    <span className="text-xl font-bold text-center">{monthName}</span>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            <div className="grid grid-cols-7 gap-2">
                                                {dayNames.map((day) => (
                                                    <div key={day} className="text-center">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-7 gap-2">
                                            {dates.map((date) => {
                                                const formattedDate = format(date, "yyyy-MM-dd");
                                                const attendance = attendanceData[formattedDate];
                                                return (
                                                    <div
                                                        key={formattedDate}
                                                        className={`text-center py-4 rounded-lg ${attendance === "present"
                                                            ? "bg-green-500"
                                                            : attendance === "absent"
                                                                ? "bg-red-500"
                                                                : "bg-gray-200"
                                                            }`}
                                                    >
                                                        <span className="font-semibold text-xl">
                                                            {format(date, "dd")}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    )
}
