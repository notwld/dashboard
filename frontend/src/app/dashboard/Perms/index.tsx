import React, { useEffect } from 'react'
import { SidebarTrigger } from '../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../components/ui/Sidebar/breadcrumb'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table/table'
import { Button } from "../../../components/ui/button"
import { useNavigate } from 'react-router-dom'
import { baseurl } from '../../../config/baseurl'
import { AlertDialog } from '@radix-ui/react-alert-dialog'
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/Alert/alert'
import { useToast } from '../../../hooks/use-toaster'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuTrigger } from '../../../components/ui/Sidebar/dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../../components/ui/Dropdown/dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/Select/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Checkbox } from "../../../components/ui/Checkbox/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/Form/form"

const items = [
  {
    id: "dashboard",
    label: "Dashboard",
  },
  {
    id: "leads",
    label: "Leads",
  },
  {
    id: "contacts",
    label: "Contacts",
  },
  {
    id: "tasks",
    label: "Tasks",
  },
  {
    id: "reports",
    label: "Reports",
  },
  {
    id: "settings",
    label: "Settings",
  },
] as const


const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
})


type Role = {
  id: string;
  name: string;
};
export default function Permissions() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [roles, setRoles] = React.useState<Role[]>([])
  const [role, setRole] = React.useState<Role>()
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
  function CheckboxReactHookFormMultiple() {
    const {toast} = useToast()
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        items: ["recents", "home"],
      },
    })
  
    async function onSubmit(data: z.infer<typeof FormSchema>) {
      if (!data.items) {
        toast({
          title: "Items Required",
          description: `Items are required.`,
        })
        return
  
      }
      if(!role){
        toast({
          title: "Role Required",
          description: `Role is required.`,
        })
        return
      }
      await fetch(baseurl + `/perm/role/${role?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json())
        .then((res) => {
          if (res.status) {
            toast({
              title: "Role Update Failed",
              description: `Role could not be updated. Reason: ${res.message}`,
            })
            return
          }
          toast({
            title: "Role Updated",
            description: `Role has been updated.`,
          })
          form.reset()
          
        }).catch((error) => {
          toast({
            title: "Role Update Failed",
            description: `Role could not be updated. Reason: ${error.message}`,
          })
        })
      // alert(JSON.stringify(data, null, 2))
      // })
    }
  
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-2xl">Permissions</FormLabel>
                  <FormDescription className='text-lg'>
                    Select the permissions you want to assign to the role.
                  </FormDescription>
                </div>
                {items.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="items"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-lg font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className='text-lg rounded-xl'>Submit</Button>
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
                <BreadcrumbPage className='text-lg'>Roles & Permissions</BreadcrumbPage>
              </BreadcrumbItem>

            </div>
          </BreadcrumbList>
        </Breadcrumb>

      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">

        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min" >
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="w-full flex justify-center items-center">
              <span className="text-lg font-semibold mr-4">Roles</span>
              <Select onValueChange={(value) => {
                setRole(roles.find((role) => role.id === value))
                console.log(value)
              } }>
                <SelectTrigger className="w-[180px]" >
                  <SelectValue placeholder="Select a Role" className='text-lg'/>

                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                    className='hover:bg-accent/50 text-lg'
                      key={role.id}
                      value={role.id}
                     
                    >
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 mt-5">
            <CheckboxReactHookFormMultiple />
          </div>
        </div>
      </div>
    </div>
  )
}
