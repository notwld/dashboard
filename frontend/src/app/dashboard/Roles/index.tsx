import { useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../../../components/ui/Sidebar/breadcrumb"
import { Separator } from "../../../components/ui/Sidebar/separator"
import { SidebarTrigger } from "../../../components/ui/Sidebar/sidebar"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../components/ui/Table/table"
  
 
  
  export function Roles() {
    const navigate = useNavigate()
    return (
        <div>
             <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem>
                                <BreadcrumbPage>Roles</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbItem >

                                <Button variant="secondary" className='rounded-xl' onClick={() => {
                                    navigate('/create-role')
                                }}>Create a Role</Button>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>

            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
                
                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min" >
                    <div className="p-4 rounded-xl bg-muted/50">
                        <Table>
                            <TableCaption>A list of all roles in the system</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Id</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-left">Created At</TableHead>
                                    <TableHead className="text-left">Updated At</TableHead>
                                    <TableHead className="text-left">Actions At</TableHead>
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
  