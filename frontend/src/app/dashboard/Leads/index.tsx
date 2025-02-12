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

const services = [
    "Web Development",
    "Logo Design",
    "SEO",
    "E-commerce",
    "SMM",
    "Video Editing",
    "Hosting",
    "PPC",
]
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


export type Lead = {
    id: string
    date: string
    time: string
    platform: string
    assigned: {
        id: string
        name: string
    }
    firstCall: string
    comments: string
    service: string
    name: string
    email: string
    number: string
    status: string
    address: string
    credits: number
    cost: number
}

const formSchema = z.object({
    date: z.date(),
    time: z.string().nonempty("Time is required."),
    platform: z.string().nonempty("Platform is required."),
    userId: z.string().nonempty("Assigned person is required."),
    firstCall: z.string().optional(),
    comments: z.string().optional(),
    status: z.string().optional(),
    service: z.string().nonempty("Service is required."),
    name: z.string().nonempty("Name is required."),
    email: z.string().email("Enter a valid email."),
    number: z.string().min(10, "Enter a valid contact number."),
    address: z.string().nonempty("Address is required."),
    credits: z.string().min(0, "Credits must be non-negative."),
    cost: z.string().min(0, "Cost must be non-negative."),
});

type User = {
    id: string
    name: string
}


export default function ManageLeads() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const downloadLeads = async () => {
        try {
            const response = await fetch(baseurl + "/lead/download-leads", {
                method: "GET",
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            })
            const data = await response.blob()
            const url = window.URL.createObjectURL(data)
            const a = document.createElement("a")
            a.href = url
            a.download = "devmize_leads.csv"
            a.click()
            toast({
                title: "Download Started",
                description: "Your download has started.",
                category: "success",
            })
        } catch (error) {
            toast({
                title: "Download Failed",
                description: "Failed to download leads.",
                category: "error",
            })
            console.error(error)
        }
    }
    const [leads, setLeads] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()
    const [open, setOpen] = React.useState({
        open: false,
        id: ""
    })
    const [isDialogOpen, setIsDialogOpen] = React.useState({
        open: false,
        lead: {}
    })
    const STATUS = [
        "New",
        "Paid",
        "Already Hired",
        "Call back scheduled",
        "Voicemail",
        "Wrong number",
        "Number not in service",
        "Refund"
    ]
    const ProfileForm = () => {

        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                date: new Date(),
                time: isDialogOpen.lead.time || "",
                platform: isDialogOpen.lead.platform || "",
                userId: isDialogOpen.lead?.assignee?.id || "",
                firstCall: isDialogOpen.lead.firstCall || "",
                comments: isDialogOpen.lead.comments || "",
                service: isDialogOpen.lead.service || "",
                status: isDialogOpen.lead.status || "",
                name: isDialogOpen.lead.name || "",
                email: isDialogOpen.lead.email || "",
                number: isDialogOpen.lead.number || "",
                address: isDialogOpen.lead.address || "",
                credits: isDialogOpen.lead.credits?.toString() || "",
                cost: isDialogOpen.lead.cost?.toString() || "",
            },
        })

        async function onSubmit(values: z.infer<typeof formSchema>) {
            console.log(values)
            try {
                setLoading(true)
                await fetch(baseurl + `/lead/update-lead/${isDialogOpen.lead.id}`, {
                    method: 'PUT',
                    headers: {
                        "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                }).then(() => {
                    // navigate('/leads')
                    toast({ title: 'Lead Updated successfully', description: 'The lead has been created successfully.', category: 'success' })
                }).catch((
                    error
                ) => {
                    console.error(error)
                    toast({ title: 'Internal server error', description: 'Please try again later.', category: 'error' })
                }).finally(() => {
                    setLoading(false)
                    fetchLeads()
                    setIsDialogOpen({
                        open: false,
                        lead: {}
                    })
                }
                )
            }
            catch (error) {
                console.error(error)
                toast({ title: 'Internal server error', description: 'Please try again later.', category: 'error' })
                setLoading(false)
            }
        }
        const [users, setUsers] = React.useState([])
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
            setLoading(false)
        }
        React.useEffect(() => {
            fetchUsers()
        }, [])
        const [name, setName] = React.useState("")
        const findName = (id: string) => {
            const user = users.find((user: User) => user.id === id)
            if (user) {
                setName(user?.name)
            }
        }
        return (
            <div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-10 gap-y-4 justify-center items-center mt-4 text-white">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date: Date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Select the date of the lead.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <Input {...field} placeholder="Enter the time of the lead" type='time' />
                                    <FormDescription>
                                        Enter the time of the lead.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="platform"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Platform</FormLabel>
                                    <Input {...field} placeholder="Enter the platform of the lead" />
                                    <FormDescription>
                                        Enter the platform of the lead.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            form.setValue("userId", value);
                                            findName(value)
                                        }}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={"Select User"}>
                                                {name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {users.map((user: User) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select the user assigned to the lead.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="firstCall"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Call</FormLabel>
                                    <Select onValueChange={(value) => {
                                        form.setValue("firstCall", value)
                                    }
                                    }>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={form?.getValues("firstCall") ? form?.getValues("firstCall") : "Select Call Status"} />

                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="answered">Answered</SelectItem>
                                                <SelectItem value="unanswered">Unanswered</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select the first call.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comments</FormLabel>
                                    <Textarea {...field} placeholder="Enter any comments" rows={3} />
                                    <FormDescription>
                                        Enter any comments about the lead.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="service"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service</FormLabel>
                                    <Select onValueChange={(value) => {
                                        form.setValue("service", value)
                                    }}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={form?.getValues("service") ? form?.getValues("service") : "Select Service"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {services.map((service) => (
                                                    <SelectItem key={service} value={service}>
                                                        {service}
                                                    </SelectItem>
                                                ))}

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select the service.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <Input {...field} placeholder="Enter the name" />
                                    <FormDescription>
                                        Enter the name of the lead.
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
                                    <Input {...field} placeholder="Enter the email" />
                                    <FormDescription>
                                        Enter the email of the lead.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number</FormLabel>
                                    <Input {...field} placeholder="Enter the number" />
                                    <FormDescription>
                                        Enter the number of the lead.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <Input {...field} placeholder="Enter the address" />
                                    <FormDescription>
                                        Enter the address.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="credits"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Credits</FormLabel>
                                    <Input {...field} placeholder="Enter the credits" type="number" min={0} />
                                    <FormDescription>
                                        Enter the credits.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cost</FormLabel>
                                    <Input {...field} placeholder="Enter the cost" type="number" min={0} />
                                    <FormDescription>
                                        Enter the cost.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="cost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={(value) => {
                                        form.setValue("status", value)
                                    }}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {STATUS.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select the status (default: Active).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='rounded-xl grid-cols-2'>{loading ? <Spinner className="mr-2">
                            <span className="sr-only">Updating Lead...</span>
                        </Spinner> : "Update Lead"}</Button>
                    </form>
                </Form>
            </div>
        )
    }
    const [permissions, setPermissions] = React.useState({
        create: false,
        read: false,
        edit: false,
        delete: false,
        donwload: false
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
            const permissionArray = ["Create Leads", "Read Leads", "Edit Leads", "Delete Leads", "Download Leads"];
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
    const [file, setFile] = React.useState<File | null>(null)
    const importLeads = async () => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await fetch(baseurl + '/lead/import-leads', {
                method: 'POST',
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData
            })
            const data = await response.json()
            if (data.status) {
                toast({
                    title: "Import Failed",
                    description: `Leads could not be imported. Reason: ${data.message}`,
                    category: "error"
                })
                return
            }
            toast({
                title: "Leads Imported",
                description: `Leads have been imported.`,
                category: "success"
            })
            fetchLeads()
        } catch (error) {
            console.error(error)
            toast({
                title: "Import Failed",
                description: `Leads could not be imported.`,
                category: "error"
            })
        }
    }
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
                return <div className='w-[120px]'>{formattedDate}</div>;
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

                return <div className='w-[120px]'>{formattedTime}</div>;
            },
        },
        {
            accessorKey: "platform",
            header: "Platform",
            cell: ({ row }) => <div>{row.getValue("platform")}</div>,
        },
        {
            accessorKey: "assignee",
            header: "Assigned",
            cell: ({ row }) => {
                const assigned = row.getValue("assignee");
                return <div>{assigned?.name}</div>;
            },
        },
        {
            accessorKey: "firstCall",
            header: "First Call",
            cell: ({ row }) => <div>{row.getValue("firstCall")}</div>,
        },
        {
            accessorKey: "comments",
            header: "Comments",
            cell: ({ row }) => <div className='w-[350px]'>{row.getValue("comments")}</div>,
        },
        {
            accessorKey: "service",
            header: "Service",
            cell: ({ row }) => <div className='w-[150px]'>{row.getValue("service")}</div>,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <div className='w-[150px]'>{row.getValue("name")}</div>,
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
            cell: ({ row }) => <div className='w-[250px]'>{row.getValue("address")}</div>,
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div
                    className={`w-[250px] text-center rounded-xl px-4 ${row.getValue("status") === "Paid" ? "bg-green-500" : "bg-red-500"}`}
                >
                    {row.getValue("status")}
                </div>
            )
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
                            {permissions.edit &&
                                <DropdownMenuItem
                                    onClick={() => {
                                        setIsDialogOpen({
                                            open: true,
                                            lead: lead
                                        })
                                    }}
                                >Edit</DropdownMenuItem>}
                            {permissions.delete &&
                                <DropdownMenuItem onClick={() => {
                                    setOpen({
                                        open: true,
                                        id: lead.id
                                    })
                                }}>
                                    Delete
                                </DropdownMenuItem>}
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
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            })
            const data = await response.json()
            
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
            })
        }
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
            const response = await fetch(baseurl + '/lead/get-leads',{
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            })
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
    const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFile(file)
    }

    const [fileModal, setFileModal] = React.useState(false)
    return (
        <div className="w-full">
            <AlertDialog open={fileModal} onOpenChange={() => setFileModal(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">Import Leads</AlertDialogTitle>
                        <AlertDialogDescription className="text-md">
                            Upload a CSV file to import leads.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <input type="file" onChange={uploadFile} />
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={importLeads}>Import</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                                        {permissions.download &&
                                            <Button className="rounded-xl"
                                                variant={"outline"}

                                                onClick={() => {
                                                    downloadLeads()
                                                }}
                                            >Export to CSV</Button>}

                                        {permissions.create &&
                                            <Button className="ml-4 rounded-xl"
                                                onClick={() => {
                                                    navigate('/create-lead')
                                                }}
                                            >Create a Lead</Button>}
                                            <Button className="ml-4 rounded-xl"
                                                onClick={() => {
                                                    setFileModal(true)
                                                }}
                                            >Import Leads</Button>

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
                                                <TableHead className='text-lg' key={header.id}>
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
                                                <TableCell className='text-lg' key={cell.id}>
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
                    <Dialog open={isDialogOpen.open} onOpenChange={() => {
                        setIsDialogOpen({
                            open: false,
                            lead: {}
                        })
                    }
                    }>

                        <DialogContent className='w-1/2'>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>
                                    <ProfileForm />

                                </DialogDescription>
                            </DialogHeader>

                        </DialogContent>
                    </Dialog>
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
