import { useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../../../components/ui/Sidebar/breadcrumb"
import { Separator } from "../../../components/ui/Sidebar/separator"
import { SidebarTrigger } from "../../../components/ui/Sidebar/sidebar"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/Table/table"
import { AlertDialog } from '@radix-ui/react-alert-dialog'
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/Alert/alert'

import { useEffect, useState } from "react"
import { baseurl } from "../../../config/baseurl"
import { useToast } from "../../../hooks/use-toaster"
import { set, z } from "zod"
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
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuTrigger } from '../../../components/ui/Sidebar/dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../../components/ui/Dropdown/dropdown'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../../components/ui/Form/form"
import { Input } from '../../../components/ui/Sidebar/input'
type Role = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export function Roles() {
    const navigate = useNavigate()
    const [roles, setRoles] = useState([])
    const [role, setRole] = useState<Role>()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { toast } = useToast()
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
    useEffect(() => {

        fetchRoles()
    }, [])
    const deleteRole = async (id: number) => {
        await fetch(baseurl + `/role/delete-role/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(() => {
                toast({
                    title: "Role Deleted",
                    description: `Role has been deleted.`,

                })
            }).catch((error) => {
                toast({
                    title: "Error",
                    description: error.message,

                })

            }).finally(() => {
                fetchRoles()
            })
    }
    function ProfileForm() {

        const formSchema = z.object({
            name: z.string().min(4, {
                message: "Name must be at least 4 characters.",
            }),
        })
        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
                name: role?.name,
            },
        })
        const onSubmit = async (values: z.infer<typeof formSchema>) => {
            if (!values.name) {
                toast({
                    title: "Name Required",
                    description: `Name is required.`,
                })
                return
            }
            await fetch(baseurl + `/role/update-role/${role?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...values})
            }).then((res) => res.json())
                .then((res) => {
                    if (res.status) {
                        toast({
                            title: "Role Update Failed",
                            description: `Role ${values.name} could not be updated. Reason: ${res.message}`,
                        })
                        return
                    }
                    toast({
                        title: "Role Updated",
                        description: `Role ${values.name} has been updated.`,
                    })
                    form.reset()
                    fetchRoles()
                    setIsDialogOpen(false)
                }).catch((error) => {
                    toast({
                        title: "Role Update Failed",
                        description: `Role ${values.name} could not be updated.`,
                    })
                    console.error(error)
                })

        }

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a name" {...field} />
                                </FormControl>
                                <FormDescription>
                                Note: Changing the name of the role will affect all users with this role.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <Button type="submit" variant={"secondary"}>Submit</Button>
                </form>
            </Form>
        )
    }
    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>

                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-lg">Roles</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbItem >

                                <Button variant="secondary" className='rounded-xl text-md' onClick={() => {
                                    navigate('/create-role')
                                }}>Create a Role</Button>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>

            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">

                <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min" >
                    <div className="p-4 rounded-xl bg-muted/50">
                        <Table>
                            <TableCaption>{roles.length} Roles found in the system.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px] text-lg">Id</TableHead>
                                    <TableHead className="text-lg">Name</TableHead>
                                    <TableHead className="text-left text-lg">Created At</TableHead>
                                    <TableHead className="text-left text-lg">Updated At</TableHead>
                                    <TableHead className="text-left text-lg">Actions At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role: Role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="text-lg">{role.id}</TableCell>
                                        <TableCell className="text-lg">{role.name}</TableCell>
                                        <TableCell className="text-lg">{role.createdAt}</TableCell>
                                        <TableCell className="text-lg">{role.updatedAt}</TableCell>
                                        <TableCell>
                                            <Dialog open={isDialogOpen} onOpenChange={() => setIsDialogOpen(!isDialogOpen)}>
                                                <DialogTrigger>
                                                    <Button variant="default" className="mr-2 rounded-xl text-lg" onClick={() => {
                                                        setRole(role)
                                                    }}>Edit</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Role</DialogTitle>
                                                        <DialogDescription>
                                                            <ProfileForm />

                                                        </DialogDescription>
                                                    </DialogHeader>

                                                </DialogContent>
                                            </Dialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger>    <Button variant="destructive" className='rounded-xl text-xl'>Delete</Button> </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your account
                                                            and remove your data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => {
                                                            deleteRole(role.id)
                                                        }}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

        </div>

    )
}
