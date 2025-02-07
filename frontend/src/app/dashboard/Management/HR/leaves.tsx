import { Button } from "../../../../components/ui/button";

export default function LeavesTable() {
  return (
    <div className="flex flex-col w-full gap-5">
        <div className="flex items-center justify-between py-4">
            <span className="text-lg font-semibold">
                Waleed asked for a leave on {new Date().toDateString()}.<br/>
                Reason: {new Date().toDateString()}
            </span>
            <div className="flex gap-3">
                <Button>
                    Approve
                </Button>
                <Button>
                    Reject
                </Button>
            </div>
        </div>
        <div className="flex items-center justify-between py-4">
            <span className="text-lg font-semibold">
                Waleed asked for a leave on {new Date().toDateString()}.<br/>
                Reason: {new Date().toDateString()}
            </span>
            <div className="flex gap-3">
                <Button>
                    Approve
                </Button>
                <Button>
                    Reject
                </Button>
            </div>
        </div>
        <div className="flex items-center justify-between py-4">
            <span className="text-lg font-semibold">
                Waleed asked for a leave on {new Date().toDateString()}.<br/>
                Reason: {new Date().toDateString()}
            </span>
            <div className="flex gap-3">
                <Button>
                    Approve
                </Button>
                <Button>
                    Reject
                </Button>
            </div>
        </div>
    </div>
  )
}
