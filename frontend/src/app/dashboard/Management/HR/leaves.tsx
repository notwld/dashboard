import { Button } from "../../../../components/ui/button";

export default function LeavesTable({ attendance = [], handleUpdateLeave }) {
    return (
        <div className="flex flex-col w-full gap-5">
            {attendance.length > 0 ? (
                attendance.map((entry, index) => (
                    entry?.isOnLeave && <div key={index} className="flex items-center justify-between py-4">
                        <span className="text-lg font-semibold">
                            {entry?.username} asked for a leave on {new Date(entry?.date).toDateString()}.
                            <br />
                            Reason: {entry?.leaveReason || "No reason provided"}
                            <br />
                            Leave Type: {entry?.leaveType}
                            <br />
                            <span className="text-sm font-semibold text-green-500">
                                {entry?.leaveStatus}
                            </span>
                        </span>
                        <div className="flex gap-3">
                            {(entry?.leaveStatus != "APPROVED" || entry?.leaveStatus != "REJECTED") ? <div className="flex gap-3">
                                <Button onClick={() => handleUpdateLeave(entry?.id, "APPROVED")}>
                                    Approve
                                </Button>
                                <Button variant="secondary" onClick={() => handleUpdateLeave(entry?.id, "REJECTED")}>
                                    Reject
                                </Button>
                            </div> : (
                                <span className="text-sm font-semibold text-gray-500">
                                    {entry?.leaveStatus}
                                </span>
                            )
                            }
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500">No leave requests found.</div>
            )}
        </div>
    );
}
