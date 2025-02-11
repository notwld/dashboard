import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "../../../../components/ui/Sidebar/input";
import { ScrollArea } from "../../../../components/ui/scroll-area";

const AttendanceCard = ({ attendanceData = [] }) => {
    const [searchName, setSearchName] = useState("");
    const [searchDate, setSearchDate] = useState("");

    // Filter attendance data based on user input
    const filteredData = attendanceData?.filter((record) => {
        const matchesName = searchName ? record.username.toLowerCase().includes(searchName.toLowerCase()) : true;
        const matchesDate = searchDate
            ? format(new Date(record.date), "yyyy-MM-dd") === searchDate
            : true;
        return matchesName && matchesDate;
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Check-In/Out</CardTitle>
                <CardDescription>Employees Attendance Overview</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex gap-2 mb-3">
                    <Input
                        type="text"
                        placeholder="Search by Name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-1/2"
                    />
                    <Input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-1/2"
                    />
                </div>

                {/* Attendance Records */}
                <ScrollArea className="h-48 rounded-md w-full">
                    {filteredData?.length > 0 ? (
                        filteredData.map((record, index) => {
                            const checkInTime = record.checkInTime
                                ? format(new Date(record.checkInTime), "hh:mm a")
                                : null;
                            const checkOutTime = record.checkOutTime
                                ? format(new Date(record.checkOutTime), "hh:mm a")
                                : null;

                                return !record?.isOnLeave ? (
                                <div key={index} className="bg-gray-900 w-full p-3 px-5 rounded-lg mb-3">
                                    <span className="font-semibold">
                                      [
                                        {format(new Date(record.date), "dd/MMM/yyyy")}
                                      ]  {record?.username} Checked In at {checkInTime} and {checkOutTime!=null?`Checked Out at ${checkOutTime}`:"has not Checked Out yet"}
                                    </span>
                                </div>
                            ) : null;
                        })
                    ) : (
                        <div className="text-center text-gray-500">No Attendance Records Found</div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default AttendanceCard;
