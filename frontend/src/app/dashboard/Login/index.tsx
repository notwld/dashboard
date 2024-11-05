import React from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '../../../components/ui/card'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
import { Input } from '../../../components/ui/Sidebar/input'
import { useToast } from '../../../hooks/use-toaster'
import { baseurl } from '../../../config/baseurl'
import { Button } from '../../../components/ui/button'
import logo from '../../../assets/logo.png'
const formSchema = z.object({
    username: z.string().min(4, {
        message: "Username must be at least 4 characters.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})


export default function LoginPage() {
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: ""
        },
    })


    return (
        <div className="h-screen w-screen">
            <div className="flex flex-col justify-center items-center w-full h-full space-y-5">
            <img src={logo} alt="logo" className="h-40" />
                <Card className='rounded-xl w-[400px]'>
                    <CardHeader>
                        <h1 className='text-2xl font-bold'>
                            Login
                        </h1>
                        <CardDescription>
                            Login to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className='flex flex-col space-y-4'>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <Input {...field} placeholder='Enter Username' />
                                            
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
                                            <Input {...field} placeholder='Enter Password' type='password' />
                                            
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type='submit' className='rounded-xl'>
                                    Submit
                                </Button>
                            </form>
                        </Form>

                    </CardContent>

                </Card>
            </div>
        </div>
    )
}
