import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../components/ui/button'
import { format } from "date-fns"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
import { Input } from '../../../components/ui/Sidebar/input'
import { useToast } from '../../../hooks/use-toaster'
import { baseurl } from '../../../config/baseurl'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Spinner } from '../../../components/ui/spinner'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '../../../components/ui/calendar'
import { cn } from '../../../lib/utils'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectValue, SelectScrollUpButton, SelectSeparator, SelectTrigger } from '../../../components/ui/Select/select'
import { Textarea } from '../../../components/ui/textarea'

const formSchema = z.object({
    date: z.date(),
    time: z.string().nonempty("Time is required."),
    platform: z.string().nonempty("Platform is required."),
    userId: z.string().nonempty("Assigned person is required."),
    firstCall: z.string().optional(),
    comments: z.string().optional(),
    service: z.string().nonempty("Service is required."),
    name: z.string().nonempty("Name is required."),
    email: z.string().email("Enter a valid email."),
    number: z.string().min(10, "Enter a valid contact number."),
    address: z.string().nonempty("Address is required."),
    credits: z.string().min(0, "Credits must be non-negative."),
    cost: z.string().min(0, "Cost must be non-negative."),
});


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
type User = {
    id: string;
    name: string;
}
export default function LeadCreateFormPage() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [roles, setRoles] = useState<Role[]>([])
    const [role, setRole] = useState<Role>()
    useEffect(() => {
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
        fetchRoles()
    }, [])
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date(),
            time: "",
            platform: "",
            userId: "",
            firstCall: "",
            comments: "",
            service: "",
            name: "",
            email: "",
            number: "",
            address: "",
            credits: "0",
            cost: "0",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        try {
            setLoading(true)
            await fetch(baseurl + "/lead/create-lead", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            }).then(() => {
                // navigate('/leads')
                toast({ title: 'Lead created successfully', description: 'The lead has been created successfully.', category: 'success' })
            }).catch((
                error
            ) => {
                console.error(error)
                toast({ title: 'Internal server error', description: 'Please try again later.', category: 'error' })
            }).finally(() => {
                setLoading(false)
            }
            )
        }
        catch (error) {
            console.error(error)
            toast({ title: 'Internal server error', description: 'Please try again later.', category: 'error' })
            setLoading(false)
        }
    }
    const [users, setUsers] = useState([])
    const fetchUsers = async () => {
        setLoading(true)
        const res = await fetch(baseurl + "/user/get-users", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        const data = await res.json()
        setUsers(data)
        setLoading(false)
    }
    useEffect(() => {
        fetchUsers()
    }, [])
    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <BreadcrumbItem>
                            <BreadcrumbPage>Create a Lead</BreadcrumbPage>
                        </BreadcrumbItem>

                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex flex- h-full w-full flex-col gap-4 p-4 justify-center items-center">
                <div className=" md:min-h-min w-1/2" >

                    <div className="aspect-video rounded-xl">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 justify-center items-center">
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
                                                }}
                                                value={field.value}  
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select User">
                                                        {form.getValues("userId") ? form.getValues("userId") : "Select User"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {users.map((user: User) => (
                                                            <SelectItem key={user.id} value={user.name}>
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
                                                    <SelectValue placeholder="Select Call Status" />
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
                                                    <SelectValue placeholder="Select Service" />
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
                                <Button type="submit" className='rounded-xl grid-cols-2'>{loading ? <Spinner className="mr-2">
                                    <span className="sr-only">Creating Lead...</span>
                                </Spinner> : "Create Lead"}</Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
