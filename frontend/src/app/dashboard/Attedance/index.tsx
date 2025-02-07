import { useState, useEffect } from "react";
import { SidebarTrigger } from "../../../components/ui/Sidebar/sidebar";
import { Separator } from "../../../components/ui/Sidebar/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../../../components/ui/Sidebar/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Calendar } from "../../../components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Progress } from "../../../components/progress";
import { Component } from "./chart";
import { WorkHoursChart } from "./workingChart";
import { Table, TableHead, TableHeader } from "../../../components/ui/Table/table";
import { Input } from "../../../components/ui/Sidebar/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Todays } from "./todayschart";
import { Weekly } from "./weekly";
import { Monthly } from "./monthly";

export default function Attendance() {
    const [selectedEmployee, setSelectedEmployee] = useState({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        leaveBalance: 3,
    });
    const [attendance, setAttendance] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [breakTime, setBreakTime] = useState(0);
    const [checkInTime, setCheckInTime] = useState(null);
    const [workedHours, setWorkedHours] = useState(0);
    const [breakHistory, setBreakHistory] = useState([]);

    const today = new Date().toISOString().split("T")[0];
    const workingHoursPerDay = 9;

    const handleAttendanceToggle = (checked) => {
        if (checked && !checkInTime) {
            setCheckInTime(new Date());
        }
        else {
            setCheckInTime(null);
        }
        setAttendance((prev) => ({ ...prev, [today]: checked }));
    };

    const handleLeaveRequest = () => {
        if (selectedDate && selectedEmployee.leaveBalance > 0) {
            // Use the selected date directly without modification
            const dateKey = selectedDate.toISOString().split("T")[0];
            setAttendance((prev) => ({ ...prev, [dateKey]: false }));
            setLeaveHistory([...leaveHistory, `Leave requested for ${dateKey}`]);
            setSelectedEmployee({
                ...selectedEmployee,
                leaveBalance: selectedEmployee.leaveBalance - 1,
            });
            setIsLeaveDialogOpen(false);
        }
    };

    const handleBreakToggle = () => {
        if (!isOnBreak) {
            const breakStartTime = new Date();
            setIsOnBreak(true);
            const timer = setInterval(() => {
                const now = new Date();
                const duration = (now - breakStartTime) / (1000 * 60); // Duration in minutes
                setBreakTime(duration);
            }, 1000);

            return () => {
                clearInterval(timer);
                const duration = breakTime;
                setBreakHistory([...breakHistory, { startTime: breakStartTime, duration }]);
                setBreakTime(0);
            };
        } else {
            setIsOnBreak(false);
        }
    };

    const formatTime = (hours) => {
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    const remainingHours = workingHoursPerDay - workedHours;

    return (
        <div className="min-h-screen relative">
            {/* Break Overlay */}
            {isOnBreak && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>On Break</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-2xl font-bold text-center">{formatTime(breakTime / 60)}</p>
                            <Button onClick={handleBreakToggle} className="w-full">
                                End Break
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                <span className="text-lg font-semibold">Attendance</span>
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>


            <div className="grid grid-cols-3 gap-5 p-4">
                <div >
                    <Card className="h-[450px]">
                        <CardHeader>
                            <CardTitle>Monthly Attendance</CardTitle>
                            <CardDescription>Current Month</CardDescription>

                        </CardHeader>
                        <CardContent className="flex justify-center items-center">
                            <Calendar
                                mode="multiple"
                                selected={Object.entries(attendance)
                                    .filter(([_, value]) => value)
                                    .map(([date]) => new Date(date))}
                                modifiers={{
                                    absent: Object.entries(attendance)
                                        .filter(([_, value]) => !value)
                                        .map(([date]) => new Date(date)),
                                }}
                                modifiersClassNames={{
                                    absent: "bg-orange-500 text-white",
                                    selected: "bg-green-500 text-white",
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="">
                    <Card className="w-full h-[450px]">
                        <CardHeader>
                            <CardTitle>Leave Details</CardTitle>
                            <CardDescription>2025</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col justify-center">
                                    <div className="flex justify-between mb-2">
                                        <p>On Time</p>
                                        <p>3</p>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <p>Late Attendance</p>
                                        <p>3</p>
                                    </div>

                                    <div className="flex justify-between mb-2">
                                        <p>Leave Balance</p>
                                        <p>3</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Leave Taken</p>
                                        <p>1</p>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <Component />
                                </div>
                                <div
                                    className="col-span-2 text-center"
                                >
                                    <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                disabled={selectedEmployee.leaveBalance === 0}
                                                className="mt-4"
                                            >
                                                Apply for Leave
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Apply For Leave</DialogTitle>
                                            </DialogHeader>


                                            <Input placeholder="Your Name" />
                                            <Input placeholder="Leave Type" />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[240px] justify-start text-left font-normal",
                                                            selectedDate
                                                            && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon />
                                                        {selectedDate ? selectedDate?.toLocaleDateString() : "Select Date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={setSelectedDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <Input placeholder="Reason" />
                                            <Button
                                                onClick={handleLeaveRequest}
                                                disabled={!selectedDate}
                                                className="w-full"
                                            >
                                                Confirm Leave
                                            </Button>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div >
                    <Card className="h-[450px]">
                        <CardHeader>
                            <CardTitle>Today's Status</CardTitle>
                            <CardDescription>
                                Checked In: {checkInTime ? checkInTime.toLocaleTimeString() : "N/A"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            
                            {checkInTime && (
                                <div className="space-y-2">
                                    <WorkHoursChart checkInTime={checkInTime} isOnBreak={isOnBreak} breakHistory={breakHistory} checked={attendance[today] || false} onCheckedChange={handleAttendanceToggle} />

                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col gap-2 text-sm">
                            <Button className="w-full" variant="secondary" onClick={handleAttendanceToggle}>
                                {attendance[today] ? "Check Out" : "Check In"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="col-span-3 w-full">
                <div className="grid grid-cols-3 gap-5">
                    <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Hours Today</CardTitle>
                                </CardHeader>
                                <CardContent>
                                   <Todays/>
                                </CardContent>
                            </Card>
                    </div>
                    <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Hours Week</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Weekly/>
                                </CardContent>
                            </Card>
                    </div>
                    <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Hours Month</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Monthly />
                                </CardContent>
                            </Card>
                    </div>
                    
                </div>

                </div>
                <div className="col-span-3 w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {leaveHistory.length > 0 ? 
                                leaveHistory.map((leave) => (
                                  <div>
                                    <p>{leave}</p>
                                  </div>
                                ))
                              
                           : (
                            <p className="text-center text-lg text-muted-foreground">No leave history</p>
                          )}

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}