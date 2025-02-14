import React, { useEffect, useState } from 'react'
import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
import { Input } from '../../../components/ui/Sidebar/input'
import { useToast } from '../../../hooks/use-toaster'
import { baseurl } from '../../../config/baseurl'
import { Spinner } from '../../../components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select/select'
import { Textarea } from '../../../components/ui/textarea'
import { set } from 'date-fns'
const formSchema = z.object({
    fullname: z.string().min(4, {
        message: "Name must be at least 4 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address."
    }),
    phoneNumber: z.string().min(11, {
        message: "Phone number must be at least 11 characters."
    }),
    paymentAmount: z.string().min(1, {
        message: "Payment amount is required."
    }),
    paymentDescription: z.string().min(4, {
        message: "Payment description must be at least 4 characters."
    }),
    packageType: z.string().min(1, {
        message: "Package is required."
    }),
    service: z.string().min(1, {
        message: "Service is required."
    }),
    brand: z.string().min(1, {
        message: "Brand is required."
    }),





})

export default function CreatePaymentLink() {
    const [permissions, setPermissions] = useState({
        create: true,
        read: true,
        update: true,
        delete: true
    })
    const [paymentLink, setPaymentLink] = useState("")
    const navigate = useNavigate()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        },
    })
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        
        setLoading(true)
        await fetch(baseurl + "/payment/create", {
            method: "POST",
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        }).then((res) => res.json())
            .then((res) => {
                if (res.status) {
                    toast({
                        title: "Role Creation Failed",
                        description: `Role ${values.name} could not be created. Reason: ${res.message}`,
                        category: "error"

                    })
                    return
                }
                toast({
                    title: "Role Created",
                    description: `Role ${values.name} has been created.`,
                    category: "success"

                })
                console.log(res)
                setPaymentLink(res.payment_link)
                // form.reset()
                // navigate("/roles")
            }).catch((error) => {
                toast({
                    title: "Role Creation Failed",
                    description: `Role ${values.name} could not be created.`,
                    category: "error"

                })
                console.error(error)
            }).finally(() => {
                setLoading(false)
            })
    }
    const packageOptions = [
        { value: 'basic', label: 'Basic Package' },
        { value: 'standard', label: 'Standard Package' },
        { value: 'premium', label: 'Premium Package' },
        { value: 'enterprise', label: 'Enterprise Package' }
    ];

    // Service options
    const serviceOptions = [

        { value: 'logo', label: 'Logo Designing' },
        { value: 'website', label: 'Website Development' },
        { value: 'ecommerce', label: 'e-Commerce' },
        { value: 'seo', label: 'Search Engine Optimization' },
        { value: 'smm', label: 'Social Media Marketing' },
        { value: 'hosting', label: 'Hosting' },
        { value: 'ppc', label: 'Pay Per Click' }
    ];
    const [brand, setBrand] = useState([])
    useEffect(()=>{
        const fetchBrands = async()=>{
            await fetch(baseurl + "/brand/all", {
                method: "GET",
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            }).then((res) => res.json())
                .then((res) => {
                    if (res.status) {
                        toast({
                            title: "Brand Fetch Failed",
                            description: `Brands could not be fetched. Reason: ${res.message}`,
                            category: "error"
    
                        })
                        return
                    }
                    console.log(res)
                    setBrand(res)
                }).catch((error) => {
                    toast({
                        title: "Brand Fetch Failed",
                        description: `Brands could not be fetched.`,
                        category: "error"
    
                    })
                    console.error(error)
                })
        }
        fetchBrands()
    },[])
    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem className='flex w-full justify-between items-center'>
                                <BreadcrumbPage className="flex justify-between items-center text-lg w-full">
                                    <div>
                                        Create Payment Link
                                    </div>
                                    {/* {permissions.create && <div>

                                        <Button className="ml-4 rounded-xl"
                                            onClick={() => {
                                                navigate('/create-role')
                                            }}
                                        >Create a Role</Button>
                                    </div>} */}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>

            </header>
            <div className="flex items-center justify-center h-full text-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="fullname"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <Input {...field} />
                                            <FormDescription>
                                                Enter the name of the customer.
                                            </FormDescription>
                                            <FormMessage {...field} />
                                        </FormItem>
                                    </FormControl>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <Input {...field} />
                                            <FormDescription>
                                                Enter the email of the customer.
                                            </FormDescription>
                                            <FormMessage {...field} />
                                        </FormItem>
                                    </FormControl>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <Input {...field} />
                                            <FormDescription>
                                                Enter the phone number of the customer.
                                            </FormDescription>
                                            <FormMessage {...field} />
                                        </FormItem>
                                    </FormControl>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentAmount"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Payment Amount</FormLabel>
                                            <Input {...field} />
                                            <FormDescription>
                                                Enter the amount (USD) to be paid.
                                            </FormDescription>
                                            <FormMessage {...field} />
                                        </FormItem>
                                    </FormControl>
                                )}
                            />
                            <div className='col-span-2'>
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Select Brand</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brand?.map((option) => (
                                                        <SelectItem
                                                            key={option.id}
                                                            value={option.id}
                                                        >
                                                            {option.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Select the brand for this payment link.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    </FormControl>
                                )}
                                />
                            </div>
                            <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="paymentDescription"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Payment Description</FormLabel>
                                            <Textarea {...field} />
                                            <FormDescription>
                                                Enter the description of the payment.
                                            </FormDescription>
                                            <FormMessage {...field} />
                                        </FormItem>
                                    </FormControl>
                                )}
                            />
                            </div>

                            <FormField
                                control={form.control}
                                name="service"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Select Service</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a service" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {serviceOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Select the service for this payment link.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    </FormControl>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="packageType"
                                render={({ field }) => (
                                    <FormControl>
                                        <FormItem>
                                            <FormLabel>Select Package</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packageOptions?.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Select the package for this payment link.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    </FormControl>
                                )}
                            />
                        </div>

                        <Button type="submit" className='rounded-xl w-full'>
                            {loading ? <Spinner className='text-black' /> : "Create Link"}
                        </Button>

                        {paymentLink && <div className="flex items-center justify-center">
                                <span>
                                    {paymentLink}
                                </span>
                                </div>
                            }
                    </form>
                </Form>
            </div>
        </div>
    )
}
