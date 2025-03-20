import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../components/ui/button'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
import { Input } from '../../../components/ui/Sidebar/input'
import { useToast } from '../../../hooks/use-toaster'
import { baseurl } from '../../../config/baseurl'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuTrigger } from '../../../components/ui/Sidebar/dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '../../../components/ui/Dropdown/dropdown'
import { Spinner } from '../../../components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select/select'
import { Textarea } from '../../../components/ui/textarea'

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
    department: z.string().optional(),
    salary: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).default('ACTIVE'),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})

type Role = {
    id: string;
    name: string;
};

type FormValues = z.infer<typeof formSchema>;

export default function UserCreateFormPage() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState<Role[]>([])
    const [role, setRole] = useState<Role>()
    const [files, setFiles] = useState<{
        profilePic: File | null;
        cnicFront: File | null;
        cnicBack: File | null;
    }>({
        profilePic: null,
        cnicFront: null,
        cnicBack: null
    });

    useEffect(() => {
        const fetchRoles = async () => {
            const res = await fetch(baseurl + "/role/get-roles", {
                method: 'GET',
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            })
            const data = await res.json()
            setRoles(data)
        }
        fetchRoles()
    }, [])
    const form = useForm<FormValues>({
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

    async function onSubmit(values: FormValues) {
        if (!values.password || values.password !== values.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: `Passwords do not match.`,
                category: 'error'
            });
            return;
        }
        if (!role) {
            toast({
                title: "Role Required",
                description: `Please select a role.`,
                category: 'error'
            });
            return;
        }
        setLoading(true);
        
        try {
            const formData = new FormData();
            
            // Append all form values
            Object.keys(values).forEach(key => {
                const value = values[key as keyof FormValues];
                if (value !== undefined && value !== '') {
                    formData.append(key, value.toString());
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

            // Convert education and experience to JSON if they're provided
            if (values.education) {
                formData.append('education', JSON.stringify([{ details: values.education }]));
            }
            if (values.experience) {
                formData.append('experience', JSON.stringify([{ details: values.experience }]));
            }

            const response = await fetch(baseurl + "/user/create-user", {
                method: "POST",
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData
            });

            const data = await response.json();

            if (data.status) {
                toast({
                    title: "User Creation Failed",
                    description: `User could not be created. Reason: ${data.message}`,
                    category: 'error'
                });
                return;
            }

            toast({
                title: "User Created",
                description: `User has been created successfully.`,
                category: 'success'
            });
            form.reset();
            setFiles({
                profilePic: null,
                cnicFront: null,
                cnicBack: null
            });
            navigate("/users");
        } catch (error) {
            console.error(error);
            toast({
                title: "User Creation Failed",
                description: `User could not be created. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`,
                category: 'error'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <BreadcrumbItem>
                            <BreadcrumbPage>Create a User</BreadcrumbPage>
                        </BreadcrumbItem>

                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex flex- h-full w-full flex-col gap-4 p-4 justify-center items-center">
                <div className=" md:min-h-min w-1/2" >

                    <div className="aspect-video rounded-xl">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                                    <Input placeholder="Enter email" {...field} />
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
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Enter password" {...field} />
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
                                                    <Input type="password" placeholder="Confirm password" {...field} />
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

                                <span className="text-sm font-semibold">Role</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className='ml-4'>
                                        <Button variant="secondary" className='rounded-xl'>{role?role.name:"Select a Role"}</Button>
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
                                <Button type="submit" className='rounded-xl'>{loading ? <Spinner className='text-black'>
                                    <span className="sr-only">Creating User...</span>
                                </Spinner> : "Create User"}</Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
