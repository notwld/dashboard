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
import { Spinner } from '../../../components/ui/spinner'
import { useState } from 'react'
const formSchema = z.object({
    name: z.string().min(4, {
        message: "Name must be at least 4 characters.",
    }),
    

})



export default function RoleCreateFormPage() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const[loading, setLoading] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name:""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if(!values.name){
            toast({
                title: "Name Required",
                description: `Name is required.`,
                
            })
            return
        }
        // alert(JSON.stringify(values, null, 2))
        setLoading(true)
        await fetch(baseurl + "/role/create-role", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(values),
        }).then((res) => res.json())
            .then((res) => {
                if(res.status){
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
                form.reset()
                navigate("/roles")
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
    

    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <BreadcrumbItem>
                            <BreadcrumbPage>Create a Role</BreadcrumbPage>
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
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
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
                               
                                <Button type="submit" className='rounded-xl'>
                                    {loading ? <Spinner className='text-black'/> : "Create Role"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}
