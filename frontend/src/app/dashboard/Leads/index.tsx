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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select/select'
export default function ManageLeads() {
    const [leads,setLeads] = React.useState([])
    const [loading,setLoading] = React.useState(false)
    const fetchLeads = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:3000/lead/get-leads')
            const data = await response.json()
            setLeads(data)
            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }
    React.useEffect(() => {
        fetchLeads()
    }, [])
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
                                    <div className='flex gap-2'>
                                        <Button className="rounded-xl"
                                                                                variant={"outline"}

                                            onClick={() => {
                                                navigate('/create-lead')
                                            }}
                                        >Export to CSV</Button>
                                        
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
            <TableCaption className="text-lg">{leads?.length} Leads in the system</TableCaption>
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
                {leads.map((lead, index) => (
                    <TableRow key={lead.id}>
                        <TableCell className='text-left text-lg'>{index + 1}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.date}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.time}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.platform}</TableCell>
                        <TableCell className='text-left text-lg'>-</TableCell>
                        <TableCell className='text-left text-lg'>{lead.firstCall}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.comments}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.service}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.name}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.email}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.number}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.address}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.credits}</TableCell>
                        <TableCell className='text-left text-lg'>{lead.cost}</TableCell>
                    </TableRow>
                ))}

            </TableBody>
        </Table>
    </div>
</div>
</div>
        </div>
    )
}
