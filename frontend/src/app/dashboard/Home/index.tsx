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
const data = [
    {
      revenue: 10400,
      subscription: 240,
    },
    {
      revenue: 14405,
      subscription: 300,
    },
    {
      revenue: 9400,
      subscription: 200,
    },
    {
      revenue: 8200,
      subscription: 278,
    },
    {
      revenue: 7000,
      subscription: 189,
    },
    {
      revenue: 9600,
      subscription: 239,
    },
    {
      revenue: 11244,
      subscription: 278,
    },
    {
      revenue: 26475,
      subscription: 189,
    },
  ]
export default function Home() {

    return (
        <div>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">

                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <BreadcrumbPage>Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="aspect-video rounded-xl bg-muted/50" >
                        
                    </div>
                    <div className="aspect-video rounded-xl bg-muted/50" />
                    <div className="aspect-video rounded-xl bg-muted/50" >
                    <Card className='h-full rounded-xl'>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    Invite your team members to collaborate.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/avatars/01.png" alt="Image" />
                                            <AvatarFallback>OM</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Sofia Davis</p>
                                            <p className="text-sm text-muted-foreground">m@example.com</p>
                                        </div>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="ml-auto">
                                                Owner{" "}
                                                <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="end">
                                            <Command>
                                                <CommandInput placeholder="Select new role..." />
                                                <CommandList>
                                                    <CommandEmpty>No roles found.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Viewer</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view and comment.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Developer</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view, comment and edit.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Billing</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view, comment and manage billing.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Owner</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Admin-level access to all resources.
                                                            </p>
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/avatars/02.png" alt="Image" />
                                            <AvatarFallback>JL</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">Jackson Lee</p>
                                            <p className="text-sm text-muted-foreground">p@example.com</p>
                                        </div>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="ml-auto">
                                                Member{" "}
                                                <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="end">
                                            <Command>
                                                <CommandInput placeholder="Select new role..." />
                                                <CommandList>
                                                    <CommandEmpty>No roles found.</CommandEmpty>
                                                    <CommandGroup className="p-1.5">
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Viewer</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view and comment.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Developer</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view, comment and edit.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Billing</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view, comment and manage billing.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Owner</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Admin-level access to all resources.
                                                            </p>
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex items-center justify-between space-x-4">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/avatars/03.png" alt="Image" />
                                            <AvatarFallback>IN</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">
                                                Isabella Nguyen
                                            </p>
                                            <p className="text-sm text-muted-foreground">i@example.com</p>
                                        </div>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="ml-auto">
                                                Member{" "}
                                                <ChevronDownIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="end">
                                            <Command>
                                                <CommandInput placeholder="Select new role..." />
                                                <CommandList>
                                                    <CommandEmpty>No roles found.</CommandEmpty>
                                                    <CommandGroup className="p-1.5">
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Viewer</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view and comment.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Developer</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view, comment and edit.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Billing</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Can view, comment and manage billing.
                                                            </p>
                                                        </CommandItem>
                                                        <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
                                                            <p>Owner</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Admin-level access to all resources.
                                                            </p>
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" >
                    <div className="aspect-video rounded-xl bg-muted/50" />
                </div>
            </div>
        </div>
    )
}
