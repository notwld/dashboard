
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/Alert/alert'
import { useState, useEffect } from "react"
import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { set, z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
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
import { format } from "date-fns"


import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '../../../components/ui/calendar'
import { cn } from '../../../lib/utils'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectValue, SelectScrollUpButton, SelectSeparator, SelectTrigger } from '../../../components/ui/Select/select'
import { Textarea } from '../../../components/ui/textarea'

import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Checkbox } from "../../../components/ui/Checkbox/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../../components/ui/Dropdown/dropdown"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/Table/table"
import { useNavigate } from 'react-router-dom'
import { baseurl } from '../../../config/baseurl'
import { Spinner } from '../../../components/ui/spinner'
import { toast, useToast } from '../../../hooks/use-toaster'
import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Input } from '../../../components/ui/Sidebar/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    department: string;
    role: {
        id: number;
        name: string;
    };
    leaveBalance: number;
    createdAt: string;
    updatedAt: string;
};


export default function Users() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const navigate = useNavigate()
    const [loading, setLoading] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [roles, setRoles] = React.useState([])
    const [role, setRole] = React.useState<Role>()
    const [users, setUsers] = React.useState([])
    const [user, setUser] = React.useState<User>()
    const [permissions, setPermissions] = React.useState({
        create: false,
        read: false,
        edit: false,
        delete: false
    })
    const columns: ColumnDef<User>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: ({column}) => {
                return (
                    <div
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="cursor-pointer text-lg"
                    >
                        Id
                    </div>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize text-lg">{row.getValue("id")}</div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className='text-lg'
                    >
                        Name
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase text-lg">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: () => <div className="text-right text-lg">Email</div>,
            cell: ({ row }) => {

                return <div className="text-right text-lg">{row.getValue("email")}</div>
            },
        },
        {
            accessorKey: "role",
            header: () => <div className="text-right text-lg">Role</div>,
            cell: ({ row }) => {

                return <div className="text-right text-xl">{row.getValue("role")?.name}</div>
            },
        },
        {
            accessorKey:"department",
            header: () => <div className="text-right text-lg">Department</div>,
            cell: ({ row }) => {

                return <div className="text-right text-xl">{row.getValue("department")}</div>
            }
        },
        {
            accessorKey: "leaveBalance",
            header: () => <div className="text-right text-lg">Leave Balance</div>,
            cell: ({ row }) => {

                return <div className="text-right text-xl">{row.getValue("leaveBalance")}</div>
            },
        },
        {
            accessorKey: "createdAt",
            header: () => <div className="text-right text-lg">Created At</div>,
            cell: ({ row }) => {

                return <div className="text-right text-xl">{format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")}</div>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(payment.id)}
                            >
                                Copy payment ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {permissions.edit && <DropdownMenuItem onClick={() => {
                                setUser(user)
                                setIsDialogOpen(true)
                                setRole(user.role)
                            }
                            }>
                                Edit</DropdownMenuItem>}
                            {permissions.delete && <DropdownMenuItem onClick={() => setIsAlertOpen({ open: true, id: user.id })}>
                                Delete
                            </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        },
    ]

    const { toast } = useToast()
    const fetchUsers = async () => {
        setLoading(true)
        const res = await fetch(baseurl + "/user/get-users", {
            method: 'GET',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        })
        const data = await res.json()
        setUsers(data)
        console.log(data)
        setLoading(false)
    }
    const fetchRoles = async () => {
        setLoading(true)
        const res = await fetch(baseurl + "/role/get-roles", {
            method: 'GET',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        })
        const data = await res.json()
        setRoles(data)
        setLoading(false)
    }
    const checkPermissions = async () => {
        const res = await fetch(baseurl + `/user/get-user/`, {
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
            const permissionArray = ["Create Users", "Read Users", "Edit Users", "Delete Users"];
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
    useEffect(() => {
        fetchUsers()
        fetchRoles()
        checkPermissions()


    }, [])
    const [isAlertOpen, setIsAlertOpen] = React.useState({
        open: false,
        id: ""
    })
    const deleteUser = async (id: number) => {
        setLoading(true)
        await fetch(baseurl + `/user/delete-user/${id}`, {
            method: 'DELETE',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        }).then(() => {
            fetchUsers()
            toast({
                title: "User Deleted",
                description: `User has been deleted.`,
                category: "success"

            })

        }).catch((error) => {
            console.error(error)
            toast({
                title: "Error",
                description: error.message,
                category: "error"

            })
        }).finally(() => {
            setLoading(false)
        })
    }
    function ProfileForm() {

        const formSchema = z.object({
            username: z.string().min(4).max(20),
            email: z.string().email(),
            department: z.string().optional(),
            password: z.string().optional(),
            confirmPassword: z.string().optional(),
            leaveBalance: z
        .string()
        .refine((val) => !isNaN(Number(val)), { message: "Must be a number" })
        .transform((val) => Number(val)), 
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
                department: user?.department,
                leaveBalance: user?.leaveBalance?.toString(),
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
            if(values.password != "" && values.confirmPassword != ""){
                if (!values.password || values.password !== values.confirmPassword) {
                    toast({
                        title: "Password Mismatch",
                        description: `Passwords do not match.`,
                    })
                    return
                }
            }
            await fetch(baseurl + `/user/update-user/${user?.id}`, {
                method: "PUT",
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...values, roleId: role?.id })
            }).then((res) => res.json())
                .then((res) => {
                    if (res.status) {
                        toast({
                            title: "User Creation Failed",
                            description: `User ${values.username} could not be created. Reason: ${res.message}`,
                            category: "error"
                        })
                        return
                    }
                    toast({
                        title: "User Updated",
                        description: `User ${values.username} has been updated.`,
                        category: "success"
                    })
                    form.reset()
                    fetchUsers()
                    setIsDialogOpen(false)


                }).catch((error) => {
                    toast({
                        title: "User Creation Failed",
                        description: `User ${values.username} could not be created. Reason: ${error.message}`,
                        category: "error"
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
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a department" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                        <FormField  
                        control={form.control}
                        name="leaveBalance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Leave Balance</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a leave balance" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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

    const table = useReactTable({
        data: users,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(!isDialogOpen)}>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            <ProfileForm />

                        </DialogDescription>
                    </DialogHeader>

                </DialogContent>
            </Dialog>
            <AlertDialog open={isAlertOpen.open} onOpenChange={() => setIsAlertOpen({ open: !isAlertOpen.open, id: "" })}>
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
                            deleteUser(isAlertOpen?.id)
                        }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem className='flex w-full justify-between items-center'>
                                <BreadcrumbPage className="flex justify-between items-center text-lg w-full">
                                    <div>
                                        Users
                                    </div>

                                    {permissions.create && <div>
                                        <Button className="ml-4 rounded-xl" onClick={() => {
                                            navigate('/create-user')
                                        }}>Create a User</Button>
                                    </div>
                                    }
                                </BreadcrumbPage>
                            </BreadcrumbItem>

                        </div>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex items-center p-4">
                <Input
                    placeholder="Filter emails..."
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border m-4">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 p-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
