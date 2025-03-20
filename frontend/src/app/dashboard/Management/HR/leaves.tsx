import { Button } from "../../../../components/ui/button";
import { Badge } from "lucide-react";

export default function LeavesTable({ attendance = [], handleUpdateLeave }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary">Pending Manager Approval</Badge>;
            case 'MANAGER_APPROVED':
                return <Badge variant="default">Manager Approved</Badge>;
            case 'MANAGER_REJECTED':
                return <Badge variant="destructive">Manager Rejected</Badge>;
            case 'HR_APPROVED':
                return <Badge variant="default">HR Approved</Badge>;
            case 'HR_REJECTED':
                return <Badge variant="destructive">HR Rejected</Badge>;
            case 'APPROVED':
                return <Badge variant="success">Approved</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const canApprove = (entry) => {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'MANAGER') {
            return entry.leaveStatus === 'PENDING';
        } else if (userRole === 'HR') {
            return entry.leaveStatus === 'MANAGER_APPROVED';
        }
        return false;
    };

    return (
        <div className="flex flex-col w-full gap-5">
            {attendance.length > 0 ? (
                attendance.map((entry, index) => (
                    entry?.isOnLeave && <div key={index} className="flex items-center justify-between py-4 border-b">
                        <div className="flex flex-col gap-2">
                            <span className="text-lg font-semibold">
                                {entry?.username}
                            </span>
                            <span className="text-sm text-gray-500">
                                Leave Type: {entry?.leaveType}
                            </span>
                            <span className="text-sm text-gray-500">
                                Date: {new Date(entry?.date).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                                Reason: {entry?.leaveReason || "No reason provided"}
                            </span>
                            {getStatusBadge(entry?.leaveStatus)}
                        </div>
                        <div className="flex gap-3">
                            {canApprove(entry) && (
                                <div className="flex gap-3">
                                    <Button onClick={() => handleUpdateLeave(entry?.id, "APPROVED")}>
                                        Approve
                                    </Button>
                                    <Button variant="secondary" onClick={() => handleUpdateLeave(entry?.id, "REJECTED")}>
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500">No leave requests found.</div>
            )}
        </div>
    );
}
