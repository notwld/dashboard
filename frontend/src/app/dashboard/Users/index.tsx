import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/Alert/alert'
import { useEffect } from "react"
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
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/Modal/dialog"
import { format } from "date-fns"

import { ArrowUpDown, MoreHorizontal } from "lucide-react"

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
import { useToast } from '../../../hooks/use-toaster'
import { Input } from '../../../components/ui/Sidebar/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { baseurl } from '../../../config/baseurl'
import { BreadcrumbList } from '../../../components/ui/Sidebar/breadcrumb'
import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb } from '../../../components/ui/Sidebar/breadcrumb'
import { BreadcrumbItem } from '../../../components/ui/Sidebar/breadcrumb'
import { BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { ChevronDown } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/Select/select"
import { Textarea } from "../../../components/ui/textarea"
import { Spinner } from "../../../components/ui/spinner"


type Role = {
    id: number;
    name: string;
};

interface EducationEntry {
    details: string;
}

interface ExperienceEntry {
    details: string;
}

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    employeeCode?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    education?: EducationEntry[];
    experience?: ExperienceEntry[];
    department: string;
    salary?: number;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
    role: {
        id: number;
        name: string;
    };
    leaveBalance: number;
    createdAt: string;
    updatedAt: string;
    profilePic?: string;
    cnicFront?: string;
    cnicBack?: string;
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
    const { toast } = useToast()
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [roles, setRoles] = React.useState<Role[]>([])
    const [role, setRole] = React.useState<Role>()
    const [users, setUsers] = React.useState<User[]>([])
    const [user, setUser] = React.useState<User>()
    const [loading, setLoading] = React.useState(false)
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
                        (table.getIsSomePageRowsSelected() && "indeterminate") ||
                        false
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
            accessorKey: "firstName",
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
            cell: ({ row }) => {
                const firstName = row.original.firstName;
                const lastName = row.original.lastName;
                return <div className="text-lg">{`${firstName} ${lastName}`}</div>;
            },
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
                const role = row.original.role;
                return <div className="text-right text-xl">{role?.name}</div>
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
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(user.id.toString())}
                            >
                                Copy user ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {permissions.edit && <DropdownMenuItem onClick={() => {
                                setUser(user)
                                setIsDialogOpen(true)
                                setRole(user.role)
                            }
                            }>
                                Edit</DropdownMenuItem>}
                            {permissions.delete && <DropdownMenuItem onClick={() => setIsAlertOpen({ open: true, id: user.id.toString() })}>
                                Delete
                            </DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        },
    ]

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch(baseurl + "/user/get-users", {
                method: 'GET',
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            })
            const data = await res.json()
            setUsers(data)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
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
            firstName: z.string().min(2, {
                message: "First name must be at least 2 characters.",
            }),
            lastName: z.string().min(2, {
                message: "Last name must be at least 2 characters.",
            }),
            employeeCode: z.string().min(2, {
                message: "Employee code must be at least 2 characters.",
            }),
            email: z.string().email(),
            phoneNumber: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            country: z.string().optional(),
            education: z.string().optional(),
            experience: z.string().optional(),
            department: z.string().min(1, "Department is required"),
            salary: z.string().optional(),
            status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).default('ACTIVE'),
            password: z.string().optional(),
            confirmPassword: z.string().optional(),
            leaveBalance: z.coerce.number().min(0, "Leave balance must be a positive number"),
            role: z.object({
                id: z.number()
            })
        })

        const [files, setFiles] = React.useState<{
            profilePic: File | null;
            cnicFront: File | null;
            cnicBack: File | null;
        }>({
            profilePic: null,
            cnicFront: null,
            cnicBack: null
        });

        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                firstName: "",
                lastName: "",
                employeeCode: "",
                email: "",
                phoneNumber: "",
                address: "",
                city: "",
                country: "",
                education: "",
                experience: "",
                department: "",
                salary: "",
                status: "ACTIVE",
                password: "",
                confirmPassword: "",
                leaveBalance: 0,
                role: {
                    id: 0
                }
            },
        })

        const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profilePic' | 'cnicFront' | 'cnicBack') => {
            const file = e.target.files?.[0];
            if (!file) return;

            setFiles(prev => ({
                ...prev,
                [type]: file
            }));
        };

        useEffect(() => {
            if (user) {
                form.reset({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    employeeCode: user.employeeCode || "",
                    email: user.email,
                    phoneNumber: user.phoneNumber || "",
                    address: user.address || "",
                    city: user.city || "",
                    country: user.country || "",
                    education: user.education ? JSON.stringify(user.education) : "",
                    experience: user.experience ? JSON.stringify(user.experience) : "",
                    department: user.department || "",
                    salary: user.salary?.toString() || "",
                    status: user.status || "ACTIVE",
                    leaveBalance: user.leaveBalance,
                    role: {
                        id: user.role.id
                    }
                });
                setRole(user.role);
            }
        }, [user, form]);

        const onSubmit = async (values: z.infer<typeof formSchema>) => {
            if (!role) {
                toast({
                    title: "Role Required",
                    description: `Role is required.`,
                })
                return
            }

            try {
                const formData = new FormData();
                
                // Append all form values
                Object.keys(values).forEach(key => {
                    const value = values[key as keyof typeof values];
                    if (value !== undefined && value !== '') {
                        if (key === 'education' || key === 'experience') {
                            formData.append(key, JSON.stringify([{ details: value }]));
                        } else if (key !== 'role' && key !== 'confirmPassword') {
                            formData.append(key, value.toString());
                        }
                    }
                });

                // Append role ID
                formData.append('roleId', role.id.toString());

                // Append files if they exist
                if (files.profilePic) {
                    formData.append('profilePic', files.profilePic);
                }
                if (files.cnicFront) {
                    formData.append('cnicFront', files.cnicFront);
                }
                if (files.cnicBack) {
                    formData.append('cnicBack', files.cnicBack);
                }

                const response = await fetch(baseurl + `/user/update-user/${user?.id}`, {
                    method: "PUT",
                    headers: {
                        "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: formData
                });

                const data = await response.json();
                
                if (data.status) {
                    toast({
                        title: "User Update Failed",
                        description: `User ${values.firstName} ${values.lastName} could not be updated. Reason: ${data.message}`,
                        category: "error"
                    });
                    return;
                }

                toast({
                    title: "User Updated",
                    description: `User ${values.firstName} ${values.lastName} has been updated successfully.`,
                    category: "success"
                });
                
                form.reset();
                setFiles({
                    profilePic: null,
                    cnicFront: null,
                    cnicBack: null
                });
                fetchUsers();
                setIsDialogOpen(false);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                toast({
                    title: "User Update Failed",
                    description: `User ${values.firstName} ${values.lastName} could not be updated. Reason: ${errorMessage}`,
                    category: "error"
                });
                console.error(error);
            }
        }

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="employeeCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter employee code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter first name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter last name" {...field} />
                                    </FormControl>
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
                                        <Input placeholder="Enter email" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter department" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salary</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter salary" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                            <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                                            <SelectItem value="TERMINATED">Terminated</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        <Input 
                                            type="number" 
                                            placeholder="Enter leave balance" 
                                            {...field}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter city" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="education"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Education</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter education details" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="experience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Past Experience</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter past experience" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter new password" {...field} />
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
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Confirm new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <FormLabel>Profile Picture</FormLabel>
                            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profilePic')} />
                        </div>
                        <div>
                            <FormLabel>CNIC Front</FormLabel>
                            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cnicFront')} />
                        </div>
                        <div>
                            <FormLabel>CNIC Back</FormLabel>
                            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cnicBack')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-semibold">Role</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" className='w-full justify-between'>
                                    {role ? role.name : "Select a Role"}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                {roles.map((r: Role) => (
                                    <DropdownMenuItem 
                                        key={r.id} 
                                        onClick={() => setRole(r)}
                                        className="justify-between"
                                    >
                                        {r.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {!role && <FormMessage>Role is required</FormMessage>}
                    </div>

                    <Button type="submit" variant="secondary" className="w-full">
                        {loading ? <Spinner className='text-black'>
                            <span className="sr-only">Updating User...</span>
                        </Spinner> : "Update User"}
                    </Button>
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
                            deleteUser(parseInt(isAlertOpen?.id))
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
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
