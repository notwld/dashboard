import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../components/ui/button'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
import { Input } from '../../../components/ui/Sidebar/input'
import { useToast } from '../../../hooks/use-toaster'
import { baseurl } from '../../../config/baseurl'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuTrigger } from '../../../components/ui/Sidebar/dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../../components/ui/Dropdown/dropdown'
import { Spinner } from '../../../components/ui/spinner'
const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email(),
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


export default function UserCreateFormPage() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState<Role[]>([])
    const [role,setRole] = useState<Role>()
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
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.password || values.password !== values.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: `Passwords do not match.`,
                category: 'error'
            })
            return
        }
        setLoading(true)
        await fetch(baseurl + "/user/create-user", {
            method: "POST",
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...values,roleId:role?.id})
        }).then((res) => res.json())
            .then((res) => {
                if(res.status){
                    toast({
                        title: "User Creation Failed",
                        description: `User ${values.username} could not be created. Reason: ${res.message}`,
                        category: 'error'
    
                    })
                    return
                }
                toast({
                    title: "User Created",
                    description: `User ${values.username} has been created.`,
                    category: 'success'

                })
                form.reset()
                navigate("/users")
            }).catch((error) => {
                toast({
                    title: "User Creation Failed",
                    description: `User ${values.username} could not be created. Reason: ${error.message}`,
                    category: 'error'

                })
                console.error(error)
            }).finally(() => {
                setLoading(false)
            })
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
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter a name.." {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                This will be public display name.
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
                                                <Input placeholder="Retype a password" {...field} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
