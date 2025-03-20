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
import { SalesChart, Status, TopPayingCustomersChart } from './chart'
import Board from './board'
import { Spinner } from "../../../components/ui/spinner"

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: {
        id: number;
        name: string;
        permissions: {
            id: number;
            name: string;
        }[]
    }
}

type Lead = {
    id: number;
    date: string;
    time: string;
    platform: string;
    firstCall: string;
    comments?: string;
    service: string;
    name: string;
    email: string;
    number: string;
    address?: string;
    credits: number;
    cost: number;
    status?: string;
    createdAt: string;
    updatedAt: string;
}

export default function Home() {
    const [darkMode, setDarkMode] = useState(() => {
        // Initialize from localStorage, default to system preference
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [users, setUsers] = useState<User[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [permissions, setPermissions] = useState({
        view: false
    })

    // Initialize theme on mount
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        
        if (darkMode) {
            root.classList.add('dark');
            body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
        }
        
        // Force a repaint to ensure styles are applied
        body.style.display = 'none';
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        body.offsetHeight; // Trigger a reflow
        body.style.display = '';
        
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setDarkMode(e.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const checkPermissions = async () => {
        try {
            const res = await fetch(baseurl + `/user/get-user`, {
                method: 'GET',
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            })
            const data = await res.json();
            if (data && data.role && data.role.permissions) {
                const permissionArray = ["View Dashboard"];
                const updatedPermissions = { ...permissions };

                data.role.permissions.forEach((permission: { name: string }) => {
                    if (permissionArray.includes(permission.name)) {
                        updatedPermissions.view = true;
                    }
                });

                setPermissions(updatedPermissions);
                setCurrentUser(data);
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
        }
    }

    const fetchUsers = async () => {
        setIsLoading(true)
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
            setIsLoading(false)
        }
    }

    const fetchLeads = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(baseurl + '/lead/get-leads', {
                headers: {
                    "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            })
            const data = await res.json()
            setLeads(data)
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
        checkPermissions()
        fetchLeads()
    }, [])

    return (
        <div className="min-h-screen transition-colors duration-200 bg-background text-foreground">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 bg-background">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <div className="flex justify-between items-center w-[81vw]">
                            <BreadcrumbItem className='flex w-full justify-between items-center'>
                                <BreadcrumbPage className="flex justify-between items-center text-lg w-full">
                                    <div className="text-foreground">
                                        Welcome {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''}
                                    </div>
                                    <div className='flex items-center space-x-4'>
                                        <span className='text-muted-foreground'>
                                            {darkMode ? 'Dark' : 'Light'} Mode
                                        </span>
                                        <Switch 
                                            checked={darkMode} 
                                            onCheckedChange={toggleDarkMode}
                                            className="data-[state=checked]:bg-primary"
                                        />
                                        <span
                                            className="underline cursor-pointer text-foreground hover:text-primary transition-colors"
                                            onClick={() => {
                                                localStorage.removeItem('token')
                                                localStorage.removeItem('user')
                                                localStorage.removeItem('theme')
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
            {permissions.view ? (
                isLoading ? (
                    <div className="flex justify-center items-center h-[80vh]">
                        <Spinner className="w-8 h-8" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 p-4 bg-background">
                        <div className="flex">
                            <div className="rounded-xl w-full bg-card text-card-foreground">
                                <SalesChart leads={leads} />
                            </div>
                        </div>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <div className="rounded-xl h-full bg-card text-card-foreground">
                                <TopPayingCustomersChart leads={leads} />
                            </div>
                            <Status leads={leads} />
                            <div className="rounded-xl">
                                <Card className='h-full rounded-xl border-border bg-card text-card-foreground'>
                                    <CardHeader>
                                        <CardTitle className='text-3xl text-foreground'>Team Members</CardTitle>
                                        <CardDescription className='text-[18px] text-muted-foreground'>
                                            {users.length} team members collaborating
                                        </CardDescription>
                                    </CardHeader>
                                    <ScrollArea className="h-[270px]">
                                        <CardContent className="grid gap-6">
                                            {users.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between space-x-4">
                                                    <div className="flex items-center space-x-4">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src="/avatars/01.png" alt="User" />
                                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                                {user.firstName[0]}{user.lastName[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-xl font-medium leading-none text-foreground">
                                                                {`${user.firstName} ${user.lastName}`}
                                                            </p>
                                                            <p className="text-lg text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="ml-auto border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                                                            >
                                                                <span className='text-lg'>{user.role.name}</span>
                                                                <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0 w-80 bg-popover text-popover-foreground border-border" align="end">
                                                            <Command className="bg-transparent">
                                                                <CommandInput placeholder="Search permissions..." className="border-border" />
                                                                <CommandList>
                                                                    <CommandEmpty className="text-muted-foreground">No permissions found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {user.role.permissions.map((permission) => (
                                                                            <CommandItem 
                                                                                key={permission.id}
                                                                                className="flex flex-col items-start px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                                                                            >
                                                                                <p className='text-lg font-medium text-foreground'>{permission.name}</p>
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    Can {permission.name.toLowerCase()}
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
                        <div className="w-full">
                            <Board leads={leads} />
                        </div>
                    </div>
                )
            ) : (
                <div className='flex justify-center items-center h-[80vh]'>
                    <h1 className='text-3xl text-muted-foreground'>You do not have permission to view this page</h1>
                </div>
            )}
        </div>
    )
}
