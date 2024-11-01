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
import { useToast } from '../../../hooks/use-toaster'


interface User {
    id: number
    name: string
    email: string
    role: {
        id: number
        name: string
    }
    createdAt: string
    updatedAt: string
}

import { set, z } from "zod"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../components/ui/Modal/dialog"
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuTrigger } from '../../../components/ui/Sidebar/dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../../components/ui/Dropdown/dropdown'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../../components/ui/Form/form"
import { Input } from '../../../components/ui/Sidebar/input'



type Role = {
    id: number;
    name: string;
};

export default function Users() {
    const navigate = useNavigate()
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [roles, setRoles] = React.useState([])
    const [role, setRole] = React.useState<Role>()
    const [users, setUsers] = React.useState([])
    const [user, setUser] = React.useState<User>()
    const { toast } = useToast()
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
    const fetchRoles = async () => {
        const res = await fetch(baseurl + "/role/get-roles", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const data = await res.json()
        setRoles(data)
    }
    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])
    const deleteUser = async (id: number) => {
        await fetch(baseurl + `/user/delete-user/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(() => {
            fetchUsers()
            toast({
                title: "User Deleted",
                description: `User has been deleted.`,

            })
        }).catch((error) => {
            console.error(error)
            toast({
                title: "Error",
                description: error.message,

            })
        })
    }
    function ProfileForm() {

        const formSchema = z.object({
            username: z.string().min(4).max(20),
            email: z.string().email(),
            password: z.string().min(8),
            confirmPassword: z.string().min(8),
            role: z.object({
                id: z.number()
            })

        })
        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                username: user?.name,
                email: user?.email,
                password: "",
                confirmPassword: "",
                role: {
                    id: 0
                }
            },
        })
        const onSubmit = async (values: z.infer<typeof formSchema>) => {
            if (!role) {
                toast({
                    title: "Role Required",
                    description: `Role is required.`,
                })
                return
            }
            if (!values.password || values.password !== values.confirmPassword) {
                toast({
                    title: "Password Mismatch",
                    description: `Passwords do not match.`,
                })
                return
            }
            await fetch(baseurl + `/user/update-user/${user?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...values, roleId: role?.id })
            }).then((res) => res.json())
                .then((res) => {
                    if (res.status) {
                        toast({
                            title: "User Creation Failed",
                            description: `User ${values.username} could not be created. Reason: ${res.message}`,
                        })
                        return
                    }
                    toast({
                        title: "User Updated",
                        description: `User ${values.username} has been updated.`,
                    })
                    form.reset()
                    fetchUsers()
                    setIsDialogOpen(false)
                  

                }).catch((error) => {
                    toast({
                        title: "User Creation Failed",
                        description: `User ${values.username} could not be created. Reason: ${error.message}`,
                    })
                    console.error(error)
                })
        }

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a username" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a email.." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <span className="text-sm font-semibold">Role</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger className='ml-4'>
                            <Button variant="secondary" className='rounded-xl'>{role ? role.name : "Select a Role"}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>

                            {roles.map((role: Role) => (
                                <DropdownMenuItem key={role.id} onClick={
                                    () => {
                                        setRole(role)
                                    }
                                }>
                                    <DropdownMenuLabel>{role.name}</DropdownMenuLabel>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {!role && <FormMessage>Role is required</FormMessage>}

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" variant={"secondary"}>Submit</Button>
                </form>
            </Form>
        )
    }
    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem>
                                <BreadcrumbPage className='text-lg'>Users</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbItem >

                                <Button variant="secondary" className='rounded-xl text-md' onClick={() => {
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
                            <TableCaption className='text-lg'>{users.length} Users found in the system.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] text-lg">Id</TableHead>
                                    <TableHead className='text-lg'>Name</TableHead>
                                    <TableHead className='text-lg'>Email</TableHead>
                                    <TableHead className="text-left text-lg">Role</TableHead>
                                    <TableHead className="text-left text-lg">Created At</TableHead>
                                    <TableHead className="text-left text-lg">Updated At</TableHead>
                                    <TableHead className="text-left text-lg">Actions At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user: User) => (
                                    <TableRow key={user.id}>
                                        <TableCell className='text-lg'>{user.id}</TableCell>
                                        <TableCell className='text-lg'>{user.name}</TableCell>
                                        <TableCell className='text-lg'>{user.email}</TableCell>
                                        <TableCell className="text-left text-lg">{user.role ? user?.role?.name : "No Role"}</TableCell>
                                        <TableCell className="text-left text-lg">{user.createdAt}</TableCell>
                                        <TableCell className="text-left text-lg">{user.updatedAt}</TableCell>
                                        <TableCell className="text-left text-lg">

                                            <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(!isDialogOpen)}>
                                                <DialogTrigger>
                                                    <Button variant="default" className="mr-2 rounded-xl text-lg" onClick={() => {
                                                        setUser(user)
                                                    }}>Edit</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Profile</DialogTitle>
                                                        <DialogDescription>
                                                            <ProfileForm />
                                                   
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                </DialogContent>
                                            </Dialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger>    <Button variant="destructive" className='rounded-xl text-lg'>Delete</Button> </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className='text-lg'>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription className='text-md'>
                                                            This action cannot be undone. This will permanently delete your account
                                                            and remove your data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => {
                                                            console.log('Deleted')
                                                            deleteUser(user.id)
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
