
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
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/Modal/dialog"
import { format } from "date-fns"


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
    id: string
    name: string
    createdAt: string
    updatedAt: string
}


export function Roles() {
    const [sorting, setSorting] = useState<SortingState>([])
    const navigate = useNavigate()
    const [roles, setRoles] = useState([])
    const [role, setRole] = useState<Role>()
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [permissions, setPermissions] = useState({
        create: false,
        read: false,
        edit: false,
        delete: false,
    });
    const { toast } = useToast()
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
    useEffect(() => {

        fetchRoles()
        checkPermissions()
    }, [])
    const [isAlertOpen, setIsAlertOpen] = useState({
        open: false,
        id: ''
    })
    const columns: ColumnDef<Role>[] = [
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
            header: () => <div className="text-lg">ID</div>,
            cell: ({ row }) => (
                <div className="text-lg capitalize">{row.getValue("id")}</div>
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
            accessorKey: "createdAt",
            header: () => <div className="text-right text-lg">Created At</div>,
            cell: ({ row }) => {

                return <div className="text-right font-medium text-lg">{format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}</div>
            },
        },
        {
            accessorKey: "updatedAt",
            header: () => <div className="text-right text-lg">Updated At</div>,
            cell: ({ row }) => {

                return <div className="text-right font-medium text-lg">{format(new Date(row.getValue("updatedAt")), "MMM dd, yyyy")}</div>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const role = row.original

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
                                onClick={() => navigator.clipboard.writeText(role.id)}
                            >
                                Copy role ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {permissions.edit && <DropdownMenuItem
                                onClick={() => {
                                    setRole(role)
                                    setIsDialogOpen(true)
                                }}
                            >
                                Edit
                            </DropdownMenuItem>}
                            {permissions.delete && <DropdownMenuItem
                                onClick={() => {
                                    setIsAlertOpen({ open: true, id: role.id })
                                }}
                            >
                                Delete

                            </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
    const deleteRole = async (id: number) => {
        setLoading(true)
        await fetch(baseurl + `/role/delete-role/${id}`, {
            method: 'DELETE',
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        })
            .then(() => {
                toast({
                    title: "Role Deleted",
                    description: `Role has been deleted.`,
                    category: "success"

                })
            }).catch((error) => {
                toast({
                    title: "Error",
                    description: error.message,
                    category: "error"

                })

            }).finally(() => {
                fetchRoles()
                setLoading(false)
            })
    }
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
            const permissionArray = ["Create Roles", "Read Roles", "Edit Roles", "Delete Roles"];
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
    function ProfileForm() {

        const formSchema = z.object({
            name: z.string().min(4, {
                message: "Name must be at least 4 characters.",
            }),
        })
        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name: role?.name,
            },
        })
        const onSubmit = async (values: z.infer<typeof formSchema>) => {
            if (!values.name) {
                toast({
                    title: "Name Required",
                    description: `Name is required.`,
                    category: "error"
                })
                return
            }
            setLoading(true)
            await fetch(baseurl + `/role/update-role/${role?.id}`, {
                method: "PUT",
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...values })
            }).then((res) => res.json())
                .then((res) => {
                    if (res.status) {
                        toast({
                            title: "Role Update Failed",
                            description: `Role ${values.name} could not be updated. Reason: ${res.message}`,
                            category: "error"
                        })
                        return
                    }
                    toast({
                        title: "Role Updated",
                        description: `Role ${values.name} has been updated.`,
                        category: "success"
                    })
                    form.reset()
                    fetchRoles()
                    setIsDialogOpen(false)
                }).catch((error) => {
                    toast({
                        title: "Role Update Failed",
                        description: `Role ${values.name} could not be updated.`,
                        category: "error"
                    })
                    console.error(error)
                }).finally(() => {
                    setLoading(false)
                })

        }


        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Note: Changing the name of the role will affect all users with this role.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <Button type="submit" variant={"secondary"}>Submit</Button>
                </form>
            </Form>
        )
    } const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data: roles,
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
            <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            <ProfileForm />
                        </DialogDescription>
                    </DialogHeader>

                </DialogContent>
            </Dialog>
            <AlertDialog open={isAlertOpen.open} onOpenChange={() => setIsAlertOpen({ open: false, id: '' })}>
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
                        <AlertDialogAction onClick={() => {
                            deleteRole(isAlertOpen.id)
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
                                        Roles
                                    </div>
                                    {permissions.create && <div>

                                        <Button className="ml-4 rounded-xl"
                                            onClick={() => {
                                                navigate('/create-role')
                                            }}
                                        >Create a Role</Button>
                                    </div>}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>

            </header>
            <div className="flex items-center p-4">
                <Input
                    placeholder="Filter names..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
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
