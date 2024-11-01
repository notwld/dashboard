import React, { useEffect } from 'react'
import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table/table'
import { Button } from "../../../components/ui/button"
import { useNavigate } from 'react-router-dom'
import { baseurl } from '../../../config/baseurl'
import { AlertDialog } from '@radix-ui/react-alert-dialog'
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/Alert/alert'

export default function Users() {
    const navigate = useNavigate()
    const [users, setUsers] = React.useState([])
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(baseurl + "/user/get-users", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const data = await res.json()
            setUsers(data)
        }
        fetchUsers()
    }, [])
    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem>
                                <BreadcrumbPage>Users</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbItem >

                                <Button variant="secondary" className='rounded-xl' onClick={() => {
                                    navigate('/create-user')
                                }}>Create a User</Button>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">

                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min" >

                    <div className="rounded-xl bg-muted/50 p-4 h-fit">
                        <Table>
                            <TableCaption>A list of all users in the system</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Id</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-left">Role</TableHead>
                                    <TableHead className="text-left">Created At</TableHead>
                                    <TableHead className="text-left">Updated At</TableHead>
                                    <TableHead className="text-left">Actions At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-left">{user.role}</TableCell>
                                        <TableCell className="text-left">{user.createdAt}</TableCell>
                                        <TableCell className="text-left">{user.updatedAt}</TableCell>
                                        <TableCell className="text-left">
                                            
                                            <Button variant="outline" className="mr-2 rounded-xl">Edit</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger>    <Button variant="destructive" className='rounded-xl'>Delete</Button> </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your account
                                                            and remove your data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={()=>{
                                                            console.log('Deleted')
                                                        }}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
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
