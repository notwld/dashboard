import React, { useEffect, useState } from 'react'
import { SidebarTrigger } from '../../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { AttendanceToday } from './attendance'
import LeavesTable from './leaves'
import { EmployeesByDepartment } from './employeesbydepartment'
import AttendanceCard from './AttendanceCard'
import { baseurl } from '../../../../config/baseurl'
import EmployeesTable from './employees'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/Tabs/tabs'
import { Input } from '../../../../components/ui/Sidebar/input'
import { Label } from '../../../../components/ui/Sidebar/label'
import { TrendingUp } from 'lucide-react'
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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${baseurl}/attendance/summary`, {
                    method: "GET",
                    headers: {
                        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch data: ${res.statusText}`);
                }

                const jsonData: AttendanceSummary = await res.json();
                setData(jsonData);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    const [absentees, setAbsentees] = useState([]);
    const fetchAbsentees = async () => {
        await fetch(baseurl + "/attendance/all-absent-users", {
            method: 'GET',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },

        }).then((res) => res.json())
            .then((data) => {
                setAbsentees(data);
                console.log(data);
            })
            .catch((err) => console.log(err));
    }
    useEffect(() => {
        fetchAbsentees();
    }, [])
    const [topEmployees, setTopEmployees] = useState([]);
    const fetchPerformance = async () => {
        await fetch(baseurl + "/attendance/top-employees", {
            method: 'GET',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },

        }).then((res) => res.json())
            .then((data) => {
                setTopEmployees(data);
            })
            .catch((err) => console.log(err));

    }
    useEffect(() => {
        fetchPerformance();
    }, [])
    const [permissions, setPermissions] = React.useState({
            view: false,
        });
        const checkPermissions = async () => {
            const res = await fetch(baseurl + `/user/get-user`, {
                method: 'GET',
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
                
            })
            let permissionObj = await res.json();
            permissionObj = permissionObj.role.permissions;
            console.log(permissionObj)
            if (permissionObj) {
                const permissionArray = ["View HR Dashboard"];
                const updatedPermissions = { ...permissions }; // Create a copy of the initial permissions
    
                permissionObj.forEach((permission) => {
                    const permissionKey = permission.name.split(" ")[0].toLowerCase();
                    if (permissionArray.includes(permission.name)) {
                        updatedPermissions[permissionKey] = true;
                    }
                });
    
                setPermissions(updatedPermissions); // Set the state once with the updated permissions
            }
            console.log(permissions)
        }
        React.useEffect(() => {
            checkPermissions()
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
           {permissions.view ? <div className="grid grid-cols-3 p-4 gap-5">
                <Card className='col-span-3'>
                    <CardHeader>
                        <CardTitle>
                            Welcome Back {localStorage.getItem('user') || "HR"}!
                        </CardTitle>
                        <CardDescription>
                            You have pending leave requests to approve or reject.
                        </CardDescription>
                    </CardHeader>
                </Card>
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
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p className="text-red-500">Error: {error}</p>
                        ) : data ? (
                            <div className="flex flex-col gap-3 w-[80%]">
                                <div className="flex justify-between items-center">
                                    <span>Total Employees</span>
                                    <span>{data.totalEmployees}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Present</span>
                                    <span>{data.presentToday}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Absent</span>
                                    <span>{data.absentToday}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Late</span>
                                    <span>{data.lateToday}</span>
                                </div>
                            </div>
                        ) : (
                            <p>No data available</p>
                        )}

                        <AttendanceToday data={data} />
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
                <Card className='col-span-2 h-64'>
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
                <Card className='h-64 ring-2 ring-green-600'>
                    <CardHeader>
                        <CardTitle>
                            Performance Overview
                        </CardTitle>
                        <CardDescription>
                            Top Employees of the Month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-48 rounded-md w-full">
                            <div className="flex flex-col gap-3">
                                {topEmployees.length > 0 ? (
                                    topEmployees.map((entry, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span>
                                                {entry?.name}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-green-500" />
                                                {entry?.performanceScore?.toFixed(1)}%
                                            </span>
                                            </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">No top performers found.</div>
                                )}

                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                
                <Tabs defaultValue="account" className="col-span-3 w-full">
                    <TabsList className="w-full py-10 justify-center items-center">
                        <TabsTrigger value="account" className='py-5 w-[50%] text-lg'>Leaves</TabsTrigger>
                        <TabsTrigger value="password" className='py-5 w-[50%] text-lg'>Absentees</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        <Card className='col-span-3'>
                            
                            <CardContent>
                                <LeavesTable attendance={attendance}
                                    handleUpdateLeave={handleUpdateLeave}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="password">
                        <Card>
                            
                            <CardContent className="my-5">
                                {absentees.length > 0 ? (
                                    absentees.map((entry, index) => (
                                        <div key={index} className="bg-slate-700 flex justify-between items-center py-4 px-5 rounded-lg my-2 cursor-pointer hover:bg-slate-800">
                                            <span>
                                                {entry.name} ({entry.email})
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">No absentees found.</div>
                                )}
                            </CardContent>
                            
                        </Card>
                    </TabsContent>
                </Tabs>
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

            </div> :<div className="flex justify-center items-center h-[80vh]">
            <h1 className='text-3xl'>You do not have permission to view this page</h1>
            </div> }
        </div>
    )
}
