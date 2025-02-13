import { useState, useEffect } from "react";
import { SidebarTrigger } from "../../../components/ui/Sidebar/sidebar";
import { Separator } from "../../../components/ui/Sidebar/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../../../components/ui/Sidebar/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Component } from "./chart";
import { WorkHoursChart } from "./workingChart";
import { Input } from "../../../components/ui/Sidebar/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { baseurl } from "../../../config/baseurl";
import { CheckInOutHistory } from "./recentChecks";

export default function Attendance() {

    const [attendance, setAttendance] = useState([]);
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

    const handleAttendanceToggle = async (checked) => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        console.log(checked, checkInTime);
        if (checked && !checkInTime) {

            // User is checking in
            const newCheckInTime = new Date();
            setCheckInTime(newCheckInTime);

            try {
                await fetch(baseurl + "/attendance/check-in", {
                    method: 'POST',
                    headers: {
                        "x-access-token": `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        checkInTime: newCheckInTime,
                    }),
                });

                fetchAttendance(); // Refresh attendance data
            } catch (error) {
                console.error("Check-in failed:", error);
            }
        } else if (checkInTime) {
            // User is checking out
            const checkOutTime = new Date();

            try {
                const response = await fetch(baseurl + "/attendance/check-out", {
                    method: 'POST',
                    headers: {
                        "x-access-token": `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        checkOutTime,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    setCheckInTime(null); // Reset check-in state
                    fetchAttendance(); // Refresh attendance data
                } else {
                    console.error("Check-out failed:", data.message);
                }
            } catch (error) {
                console.error("Check-out error:", error);
            }
        }
    };

    const fetchAttendance = async () => {
        await fetch(baseurl + "/attendance/all-attendance", {
            method: 'POST',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: localStorage.getItem('userId'),
            }),
        }).then((res) => res.json())
            .then((data) => {
                setAttendance(data);
                const todays = data.find((entry) => entry.date.split("T")[0] === today);
                if (todays) {
                    setCheckInTime(new Date(todays.date));
                }
                
                console.log(data);
            })
            .catch((err) => console.log(err));
    }
    useEffect(() => {
        const fetchData = async () => {
            await fetchAttendance();
        };
        fetchData();
    }, []);
    const handleLeaveRequest = async () => {
        await fetch(baseurl + "/attendance/apply-leave", {
            method: 'POST',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: localStorage.getItem('userId'),
                date: selectedDate,
                reason: reason,
                leaveType: leaveType,
            }),
        }).then((res) => res.json())
            .then((data) => {
                console.log(data);
                setLeaveHistory([...leaveHistory, data.message]);
                setIsLeaveDialogOpen(false);
        })
        
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
    useEffect(() => {
        if (!attendance.length) return; // Ensure attendance is available
    
        const interval = setInterval(async () => {
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");
            const checkInEntry = attendance.find(
                (entry) => entry.date.split("T")[0] === today && entry.checkIn
            );
    
            if (!checkInEntry) {
                console.warn("No check-in data found, skipping periodic update.");
                return;
            }
    
            try {
                const response = await fetch(baseurl + "/attendance/periodic-update", {
                    method: "POST",
                    headers: {
                        "x-access-token": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId,
                        attendanceId: checkInEntry.id,
                        checkInTime: checkInEntry.checkIn,
                    }),
                });
    
                const data = await response.json();
                console.log("Periodic update:", data);
                fetchAttendance(); // Refresh after update
            } catch (error) {
                console.error("Error in periodic update:", error);
            }
        }, 5000);
    
        return () => clearInterval(interval);
    }, [attendance]); // <-- Ensure this runs when `attendance` updates 

    const formatTime = (hours) => {
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        return `${h}h ${m}m`;
    };

    

    // Calculate worked hours
    useEffect(() => {
        if (checkInTime) {
            const interval = setInterval(() => {
                const now = new Date();
                let totalWorked = (now - checkInTime) / (1000 * 60 * 60); // Convert ms to hours

                // Subtract break durations
                let totalBreakTime = breakHistory.reduce((acc, breakEntry) => {
                    if (breakEntry.start && breakEntry.end) {
                        return acc + (new Date(breakEntry.end) - new Date(breakEntry.start)) / (1000 * 60 * 60);
                    }
                    return acc;
                }, 0);

                setWorkedHours(Math.max(0, totalWorked - totalBreakTime));
            }, 1000); // Update every second

            return () => clearInterval(interval);
        } else {
            setWorkedHours(0);
        }
    }, [checkInTime, breakHistory]);
    const [leaveType, setLeaveType] = useState("");
    const [reason, setReason] = useState("");
    const [attendanceData, setAttendanceData] = useState({
        onTime: 0,
        late: 0,
        leaveBalance: 0,
        leavesTaken: 0,
      });
    useEffect(() => {
        fetchAttendanceSummary();
      }, []);
    
      const fetchAttendanceSummary = async () => {
        try {
          const userId = localStorage.getItem("userId"); // Ensure userId is stored in localStorage
          const response = await fetch(baseurl+"/attendance/user-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          });
    
          if (!response.ok) throw new Error("Failed to fetch data");
    
          const data = await response.json();
          setAttendanceData(data);
        } catch (error) {
          console.error("Error fetching attendance summary:", error);
        }
      };
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
                <div className="col-span-3 w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>
                                Welcome {localStorage.getItem("user") || "User"}
                            </CardTitle>
                            <CardDescription>
                                Full Stack Developer
                            </CardDescription>
                        </CardHeader>
                        <CheckInOutHistory attendance={attendance} />
                    </Card>

                </div>
                <div >
                    <Card className="h-[450px]">
                        <CardHeader>
                            <CardTitle>Monthly Attendance</CardTitle>
                            <CardDescription>Current Month</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center items-center">
                            <Calendar
                                mode="multiple"
                                selected={attendance
                                    ?.filter((entry) => entry?.isPresent === true)
                                    ?.map((entry) => entry?.date ? new Date(entry.date) : null)
                                    ?.filter(Boolean)} // Remove null values
                                modifiers={{
                                    absent: attendance
                                        ?.filter((entry) => entry?.isPresent === false && entry?.isOnLeave === false)
                                        ?.map((entry) => entry?.date ? new Date(entry.date) : null)
                                        ?.filter(Boolean),
                                    leave: attendance
                                        ?.filter((entry) => entry?.isOnLeave === true && entry?.leaveStatus === "APPROVED")
                                        ?.map((entry) => entry?.date ? new Date(entry.date) : null)
                                        ?.filter(Boolean),
                                    late: attendance
                                        ?.filter((entry) => entry?.isLate === true)
                                        ?.map((entry) => entry?.date ? new Date(entry.date) : null)
                                        ?.filter(Boolean),
                                }}
                                modifiersClassNames={{
                                    absent: "bg-red-500 text-white",
                                    selected: "bg-green-500 text-white",
                                    leave: "bg-gray-500 text-white",
                                    late: "bg-yellow-500 text-white",
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
              <p>{attendanceData.onTime}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Late Attendance</p>
              <p>{attendanceData.late}</p>
            </div>
            <div className="flex justify-between mb-2">
              <p>Leave Balance</p>
              <p>{attendanceData.leaveBalance}</p>
            </div>
            <div className="flex justify-between">
              <p>Leave Taken</p>
              <p>{attendanceData.leavesTaken}</p>
            </div>
          </div>
          <div className="flex flex-col">
            <Component />
          </div>
          <div className="col-span-2 text-center">
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={attendanceData.leaveBalance === 0} className="mt-4">
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply For Leave</DialogTitle>
                </DialogHeader>
                <Input placeholder="Your Name" disabled defaultValue={localStorage.getItem("user") || "Enter your name"} />
                <Input onChange={(e) => setLeaveType(e.target.value)} placeholder="Leave Type" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                      <CalendarIcon />
                      {selectedDate ? selectedDate.toLocaleDateString() : "Select Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
                <Input placeholder="Reason" onChange={(e) => setReason(e.target.value)} />
                <Button onClick={() => handleLeaveRequest()} disabled={!selectedDate} className="w-full">
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
                    <Card className="h-[450px] ring-1 animate-pulse ring-orange-900 hover:animate-none">
                        <CardHeader>
                            <CardTitle>Today's Status</CardTitle>
                            <CardDescription>
                                Checked In: {checkInTime ? checkInTime.toLocaleTimeString() : "N/A"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {checkInTime && (
                                <div className="space-y-2">
                                    <WorkHoursChart
                                        checkInTime={checkInTime}
                                        isOnBreak={isOnBreak}
                                        breakHistory={breakHistory}
                                        onCheckedChange={handleAttendanceToggle}
                                    />
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col gap-2 text-sm">
                            <Button className="w-full" variant="secondary" onClick={handleAttendanceToggle}>
                                {checkInTime ? "Check Out" : "Check In"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>




                <div className="col-span-3 w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {
                                attendance?.filter((entry) => entry.isOnLeave === true).map((entry, index) => (
                                    <div key={index} className="flex flex-col gap-2 my-2">
                                     <p>
                                        You applied for leave on {
                                            new Date(entry.date).toLocaleDateString()
                                        } which is {entry.leaveStatus?.toLowerCase()}.
                                    </p>
                                    </div>
                                ))
                            }

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}