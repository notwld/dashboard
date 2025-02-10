import React, { useEffect, useState } from 'react'
import { SidebarTrigger } from '../../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { AttendanceToday } from './attendance'
import { EmployeesTable } from './employees'
import LeavesTable from './leaves'
import { EmployeesByDepartment } from './employeesbydepartment'
import AttendanceCard from './AttendanceCard'
import { baseurl } from '../../../../config/baseurl'
export default function HR() {
    const [attendance, setAttendance] = useState([]);
    const fetchAttendance = async () => {
        await fetch(baseurl + "/attendance/all/hr", {
            method: 'GET',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },

        }).then((res) => res.json())
            .then((data) => {
                setAttendance(data.formattedData);
            })
            .catch((err) => console.log(err));
    }
    useEffect(() => {
        fetchAttendance();
    }
        , []);

    const handleUpdateLeave = async (id, status) => {
        console.log(id, status);
        await fetch(baseurl + "/attendance/update-leave", {
            method: 'POST',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                status
            })
        }).then((res) => res.json())
            .then((data) => {
                fetchAttendance();
                fetchUserLeaves();
            })
            .catch((err) => {
                console.log(err);

            })
    }
    const [leaveBalance, setLeaveBalance] = useState([]);
    const fetchUserLeaves = async () => {
        await fetch(baseurl + "/attendance/get-users", {
            method: 'GET',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },

        }).then((res) => res.json())
            .then((data) => {
                setLeaveBalance(data);
            })
            .catch((err) => console.log(err));

    }
    useEffect(() => {
        fetchUserLeaves();
    }, [])
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
                                        HR Management
                                    </div>

                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="grid grid-cols-3 p-4 gap-5">
                <AttendanceCard attendanceData={attendance} />
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Attendance Overview
                        </CardTitle>
                        <CardDescription>
                            {new Date().toDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-5 w-full justify-center items-center">
                        <div className="flex flex-col gap-3 w-[80%]">
                            <div className="flex justify-between items-center">
                                <span>
                                    Total Employees
                                </span>
                                <span>
                                    10
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>
                                    Present
                                </span>
                                <span>
                                    8
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>
                                    Absent
                                </span>
                                <span>
                                    2
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>
                                    Late
                                </span>
                                <span>
                                    1
                                </span>
                            </div>
                        </div>
                        <AttendanceToday />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Leave Overview
                        </CardTitle>
                        <CardDescription>
                            Employees and their remaining leaves
                        </CardDescription>
                    </CardHeader>
                    <CardContent >
                        <ScrollArea className="h-48 rounded-md  w-full" >
                            <div className="flex flex-col gap-3">
                                {leaveBalance.length > 0 ? (
                                    leaveBalance.map((entry, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span>
                                                {entry?.name}
                                            </span>
                                            <span>
                                                {entry?.leaveBalance} Leaves
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">No leave balance found.</div>
                                )}
                            </div>
                    


                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card className='col-span-3'>
                    <CardHeader>
                        <CardTitle>
                            Leaves
                        </CardTitle>
                        <CardDescription>
                            Pending Leaves Requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LeavesTable attendance={attendance}
                            handleUpdateLeave={handleUpdateLeave}
                        />
                    </CardContent>
                </Card>
                <Card className='col-span-3'>
                    <CardHeader>
                        <CardTitle>
                            Employees By Department

                        </CardTitle>
                        <CardDescription>
                            Number of Employees in each Department
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='flex justify-center items-center'>
                        <EmployeesByDepartment />
                    </CardContent>
                </Card>
                <Card className='col-span-3'>
                    <CardHeader>
                        <CardTitle>
                            Employees Overview
                        </CardTitle>
                        <CardDescription>
                            Employees and their Status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmployeesTable />
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
