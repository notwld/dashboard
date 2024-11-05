import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/Alert/alert'
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


export type Lead = {
    id: string
    date: string
    time: string
    platform: string
    assigned: string
    firstCall: string
    comments: string
    service: string
    name: string
    email: string
    number: string
    address: string
    credits: number
    cost: number
}



export default function ManageLeads() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})


    const [leads, setLeads] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()
    const [open, setOpen] = React.useState({
        open: false,
        id: ""
    })
    const columns: ColumnDef<Lead>[] = [
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
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                const dateValue = new Date(row.getValue("date"));
                const formattedDate = dateValue.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
                return <div>{formattedDate}</div>;
            },
        },
        {
            accessorKey: "time",
            header: "Time",
            cell: ({ row }) => {
                const timeString = row.getValue("time");
                const [hours, minutes] = timeString.split(":").map(Number);
                const date = new Date();
                date.setHours(hours, minutes);

                const formattedTime = date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true
                });

                return <div>{formattedTime}</div>;
            },
        },
        {
            accessorKey: "platform",
            header: "Platform",
            cell: ({ row }) => <div>{row.getValue("platform")}</div>,
        },
        {
            accessorKey: "assigned",
            header: "Assigned",
            cell: ({ row }) => <div>{row.getValue("assigned")}</div>,
        },
        {
            accessorKey: "firstCall",
            header: "First Call",
            cell: ({ row }) => <div>{row.getValue("firstCall")}</div>,
        },
        {
            accessorKey: "comments",
            header: "Comments",
            cell: ({ row }) => <div>{row.getValue("comments")}</div>,
        },
        {
            accessorKey: "service",
            header: "Service",
            cell: ({ row }) => <div>{row.getValue("service")}</div>,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <div>{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div>{row.getValue("email")}</div>,
        },
        {
            accessorKey: "number",
            header: "Number",
            cell: ({ row }) => <div>{row.getValue("number")}</div>,
        },
        {
            accessorKey: "address",
            header: "Address",
            cell: ({ row }) => <div>{row.getValue("address")}</div>,
        },
        {
            accessorKey: "credits",
            header: "Credits",
            cell: ({ row }) => <div>{row.getValue("credits")}</div>,
        },
        {
            accessorKey: "cost",
            header: "Cost",
            cell: ({ row }) => <div>{row.getValue("cost")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const lead = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(lead.id)}
                            >
                                Copy Lead ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                setOpen({
                                    open: true,
                                    id: lead.id
                                })
                            }}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );

            },
        },
    ]
    const deleteLead = async (id: string) => {
        try {
            const response = await fetch(baseurl + `/lead/delete-lead/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            const data = await response.json()
            if (data.status) {
                toast({
                    title: "Lead Deletion Failed",
                    description: `Lead could not be deleted. Reason: ${data.message}`,
                    category: "error"
                })
                return
            }
            toast({
                title: "Lead Deleted",
                description: `Lead has been deleted.`,
                category: "success"
            })
            fetchLeads()
            setOpen({
                open: false,
                id: ""
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Lead Deletion Failed",
                description: `Lead could not be deleted.`,
                category: "error"
            })
            setOpen({
                open: false,
                id: ""
            })        }
    }
    const table = useReactTable({
        data: leads,
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
    const fetchLeads = async () => {
        try {
            setLoading(true)
            const response = await fetch(baseurl + '/lead/get-leads')
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
    return (
        <div className="w-full">
            <AlertDialog open={open.open} onOpenChange={() => {
                setOpen({
                    open: false,
                    id: ""
                })
            }}>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-md">
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteLead(open.id)}>
                            Continue
                        </AlertDialogAction>
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
                    <div className="flex mb-4">
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
                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                    <div className="rounded-md border">
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
                                            {loading ? <Spinner /> : "No Result"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
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
            </div>
        </div>
    )
}
