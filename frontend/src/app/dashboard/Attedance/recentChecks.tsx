import React from "react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { CardContent } from "../../../components/ui/card";

const formatDate = (dateString) => {
  if (!dateString) return "Unknown Date"; // Handle missing dates
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "Not Checked Out"; // Handle missing checkOut
  return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

export function CheckInOutHistory({ attendance = [] }) {
  const recentAttendance = attendance.slice(-10).reverse(); // Get the last 10 records, show newest first

  return (
    <CardContent className="flex flex-col gap-4">
      <div>
        <span className="text-lg font-semibold">Check In/Out History</span>
      </div>
      <ScrollArea className="h-48 rounded-md w-full">
        {recentAttendance.length > 0 ? (
          recentAttendance.map((entry, index) => (
            <div key={index} className="flex flex-col gap-2 my-2">
              {/* Date */}
             {!entry.isOnLeave&& <p className="text-center font-medium text-gray-600">{formatDate(entry.date)}
                <br /> {entry?.isOnLeave==true && entry?.leaveStatus=="PENDING" ? "On Leave" : `worked for ${entry?.totalHours?.toFixed(1)} hours`}
              </p>}

              {/* Check-in/out time display */}
              {!entry.isOnLeave&&(<div className="flex justify-between items-center gap-4">
                <div className="flex flex-col justify-center items-center">
                  <p className="text-center">
                    {entry.isOnLeave==true && entry.leaveStatus=="PENDING" ? "On Leave" : formatTime(entry?.checkIn)}
                   </p>
                </div>
                <div className="bg-slate-800 w-full h-1 rounded-full" />
                <div className="flex flex-col justify-center items-center">
                  <p className="text-center">{entry.isOnLeave==true && entry.leaveStatus=="PENDING" ? "On Leave" : formatTime(entry?.checkOut)}
                  </p>
                </div>
              </div>)}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No attendance records found.</p>
        )}
      </ScrollArea>
    </CardContent>
  );
}
