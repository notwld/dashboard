import React, { useState } from 'react'
import { SidebarTrigger } from '../../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card'
import { ScrollArea } from '../../../../components/ui/scroll-area'
import { AttendanceToday } from './attendance'
import { EmployeesTable } from './employees'
import { LeavesTable } from './leaves'
export default function HR() {
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
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Check-In/Out
                        </CardTitle>
                        <CardDescription>
                            Employees Attendance Overview
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-48 rounded-md  w-full" >
                            <div className='bg-gray-900 w-full p-3 px-5 rounded-lg mb-3'>
                                <span className='font-semibold'>
                                    Waleed Checked Out at 12:00 AM
                                </span>
                            </div>
                            <div className='bg-gray-900 w-full p-3 px-5 rounded-lg mb-3'>
                                <span className='font-semibold'>
                                    Waleed Checked In at 9:00 AM
                                </span>
                            </div>
                            <div className='bg-gray-900 w-full p-3 px-5 rounded-lg mb-3'>
                                <span className='font-semibold'>
                                    Waleed Checked In at 9:00 AM
                                </span>
                            </div>
                            <div className='bg-gray-900 w-full p-3 px-5 rounded-lg'>
                                <span className='font-semibold'>
                                    Waleed Checked In at 9:00 AM
                                </span>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
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
                            Employees and their Leave Status
                        </CardDescription>
                    </CardHeader>
                    <CardContent >
                        <ScrollArea className="h-48 rounded-md  w-full" >
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            <div className=' w-full my-3 flex justify-between items-center'>
                                <span className='font-semibold'>
                                    Waleed
                                </span>
                                <span className='font-semibold'>
                                    3 Leaves
                                </span>
                            </div>
                            
                            
                        </ScrollArea>
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
                        <LeavesTable />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
