import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '@radix-ui/react-separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,

} from "../../../components/ui/card"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../../components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { Switch } from '../../../components/ui/switch'
import { useEffect, useState } from 'react'
import { baseurl } from '../../../config/baseurl'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { Chart1, SalesChart, Status, TopPayingCustomersChart, TopServicesChart } from './chart'
import Board from './board'
type User = {
    id: string
    name: string
    email: string
    role: {
        id: string
        name: string
        permissions: {
            id: string
            name: string
        }[]
    }
}
export default function Home() {
    const [darkMode, setDarkMode] = useState(true)
    const [users, setUsers] = useState([])
    const [user, setUser] = useState(localStorage.getItem('user'))
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(false)
    const [permissions, setPermissions] = useState({
            view:false
        })
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
                                const permissionArray = ["View Dashboard"];
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
                            checkPermissions()
                        }, [])
    const togggleDarkMode = () => {
        if (darkMode) {
            document.body.classList.remove("dark")
        }
        else {
            document.body.classList.add("dark")
        }
    }
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
    const fetchLeads = async () => {
        setLoading(true)
        const res = await fetch(baseurl + '/lead/get-leads', {
            headers: {
                "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            }
        })

        const data = await res.json()
        console.log(data)
        setLeads(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchUsers()
        setUser(localStorage.getItem('user'))
        fetchLeads()
    }, [])
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

                                        Welcome {user}
                                    </div>
                                    <div className='flex items-center space-x-4'>
                                        <span className='text-muted-foreground'>
                                            Dark Mode
                                        </span>
                                        <Switch checked={darkMode} onCheckedChange={
                                            () => {
                                                setDarkMode(!darkMode)
                                                togggleDarkMode()
                                            }
                                        } />
                                        <span
                                            className="underline cursor-default hover:cursor-pointer"
                                            onClick={() => {
                                                localStorage.removeItem('token')
                                                localStorage.removeItem('user')
                                                window.location.reload()
                                            }}
                                        >
                                            Logout
                                        </span>
                                    </div>
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            {permissions.view ? <div className="flex flex-col gap-4 p-4">
                <div className="flex" >
                    <div className=" rounded-xl" >
                        <SalesChart leads={leads} />
                    </div>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className=" rounded-xl h-full" >
                        <TopPayingCustomersChart leads={leads} />
                    </div>
                    <Status leads={leads} />

                    <div className=" rounded-xl " >
                        <Card className='h-full rounded-xl'>
                            <CardHeader>
                                <CardTitle className='text-3xl'>Team Members</CardTitle>
                                <CardDescription className='text-[18px]'>
                                    Invite your team members to collaborate.
                                </CardDescription>
                            </CardHeader>
                            <ScrollArea className="h-[270px]">
                                <CardContent className="grid gap-6">
                                    {users?.length != 0 && users?.map((user: User) => (

                                        <div className="flex items-center justify-between space-x-4">
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="/avatars/01.png" alt="Image" />
                                                    <AvatarFallback>{user?.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-xl font-medium leading-none">{user.name}</p>
                                                    <p className="text-lg text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm" className="ml-auto">
                                                        <span className='text-lg'>{user?.role?.name}</span>
                                                        <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="end">
                                                    <Command>
                                                        <CommandInput placeholder="Select new role..." />
                                                        <CommandList>
                                                            <CommandEmpty>No roles found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {user?.role?.permissions?.map((permission, index) => (
                                                                    <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2" key={index}>
                                                                        <p className='text-lg'>{permission.name}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            This user can {permission.name.toLowerCase()}.
                                                                        </p>
                                                                    </CommandItem>
                                                                ))}

                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                    ))}

                                </CardContent>
                            </ScrollArea>
                        </Card>
                    </div>
                </div>
            <div>
                <Board leads={leads} />
            </div>
            </div> : <div className='flex justify-center items-center h-[80vh]'>
                <h1 className='text-3xl'>You do not have permission to view this page</h1>
            </div>}
        </div>
    )
}
