import React from 'react'
import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../components/ui/button'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/Table/table"
import { useNavigate } from 'react-router-dom'
export default function ManageLeads() {
    const [leads,setLeads] = React.useState([])
    const [loading,setLoading] = React.useState(false)
    const navigate = useNavigate()
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
                                        Leads
                                    </div>
                                    <div>
                                        <Button className="ml-4 rounded-xl"
                                            onClick={() => {
                                                navigate('/create-lead')
                                            }}
                                        >Create a Lead</Button>
                                    </div>
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">

<div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min" >
    <div className="p-4 rounded-xl bg-muted/50">
        <Table>
            <TableCaption className="text-lg">Leads</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableCell className='text-left text-lg'>S.No</TableCell>
                    <TableCell className='text-left text-lg'>Date</TableCell>
                    <TableCell className='text-left text-lg'>Time</TableCell>
                    <TableCell className='text-left text-lg'>Platfrom</TableCell>
                    <TableCell className='text-left text-lg'>Assigned</TableCell>
                    <TableCell className='text-left text-lg'>First Call</TableCell>
                    <TableCell className='text-left text-lg'>Comments</TableCell>
                    <TableCell className='text-left text-lg'>Service</TableCell>
                    <TableCell className='text-left text-lg'>Name</TableCell>
                    <TableCell className='text-left text-lg'>Email</TableCell>
                    <TableCell className='text-left text-lg'>Number</TableCell>
                    <TableCell className='text-left text-lg'>Address</TableCell>
                    <TableCell className='text-left text-lg'>Credits</TableCell>
                    <TableCell className='text-left text-lg'>Cost</TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                

            </TableBody>
        </Table>
    </div>
</div>
</div>
        </div>
    )
}
