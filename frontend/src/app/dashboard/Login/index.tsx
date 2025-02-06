import { Card, CardContent, CardDescription, CardHeader } from '../../../components/ui/card'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form,  FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/Form/form'
import { Input } from '../../../components/ui/Sidebar/input'
import { useToast } from '../../../hooks/use-toaster'
import { baseurl } from '../../../config/baseurl'
import { Button } from '../../../components/ui/button'
import logo from '../../../assets/logo.png'
import { useNavigate } from 'react-router-dom'

const formSchema = z.object({
    email: z.string().min(4, {
        message: "email must be at least 4 characters.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})


export default function LoginPage() {
    const { toast } = useToast()
    const navigate = useNavigate()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const response = await fetch(`${baseurl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            const json = await response.json()
            if (response.ok) {
                localStorage.setItem('token', json.token)
                localStorage.setItem('user', json.user.name)
                localStorage.setItem('userId', json.user.id)
                toast({
                    title: 'Success',
                    description: 'Logged in successfully',
                    category: 'success'
                })
                navigate('/dashboard')
                window.location.reload()
            } else {
                toast({
                    title: 'Error',
                    description: json.message,
                    category: 'error'
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'An error occurred',
                category: 'error'
            })

        }
    }


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
                            Enter your credentials to sign in
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form className='flex flex-col space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <Input {...field} placeholder='Enter email' />
                                            
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
