import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "../../../components/ui/Checkbox/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/Form/form";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select/select";
import { baseurl } from "../../../config/baseurl";
import { useToast } from "../../../hooks/use-toaster";
import { SidebarTrigger } from "../../../components/ui/Sidebar/sidebar";
import { Separator } from "../../../components/ui/Sidebar/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../../../components/ui/Sidebar/breadcrumb";
import { Spinner } from "../../../components/ui/spinner";

const items = [
  { name: "Create Users", label: "Create Users" },
  { name: "Edit Users", label: "Edit Users" },
  { name: "Delete Users", label: "Delete Users" },
  { name: "Create Roles", label: "Create Roles" },
  { name: "Edit Roles", label: "Edit Roles" },
  { name: "Delete Roles", label: "Delete Roles" },
  {name:"Create Leads", label:"Create Leads"},
  {name:"Edit Leads", label:"Edit Leads"},
  {name:"Delete Leads", label:"Delete Leads"},
  {name:"Create Permissions", label:"Create Permissions"},
  {name:"Download Leads", label:"Download Leads"},

] as const;

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.length > 0, {
    message: "You have to select at least one item.",
  }),
});

type Role = {
  id: string;
  name: string;
};

const Permissions = () => {
  const { toast } = useToast();
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [role, setRole] = React.useState<Role>();
  const [loading, setLoading] = React.useState(false);
  const [rolePermissions, setRolePermissions] = React.useState<string[]>([]);
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { items: [] },
  });
  const [permissions, setPermissions] = React.useState({
    create: false,
   
  });
  const checkPermissions = async () => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    const res = await fetch(baseurl + `/user/get-user/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    let permissionObj = await res.json();
    permissionObj = permissionObj.role.permissions;
    console.log(permissionObj)
    if (permissionObj) {
        const permissionArray = ["Create Permissions"];
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
React.useEffect(() => {
    checkPermissions()
}, [])
  // Fetch roles data
  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch(baseurl + "/role/get-roles", { method: "GET", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      setRoles(data);
    };
    fetchRoles();
  }, []);

  // Fetch role permissions whenever a role is selected
  useEffect(() => {
    if (role?.id) {
      const fetchRolePermissions = async () => {
        setLoading(true);
        const res = await fetch(`${baseurl}/perm/role/${role.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        const permissionNames = data.map((perm: { name: string }) => perm.name);
        setRolePermissions(permissionNames);
        form.setValue("items", permissionNames); 
        setLoading(false);
      };
      fetchRolePermissions();
    }
  }, [role, form]);

  async function onSubmit(data) {
    if (!role) {
      toast({ title: "Role Required", description: "Please select a role.", category: "error" });
      return;
    }
    setLoading(true);
    await fetch(`${baseurl}/perm/role/${role.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        toast({
          title: res.status ? "Role Update Failed" : "Role Updated",
          description: res.status ? `Failed: ${res.message}` : "Role has been successfully updated.",
          category: res.status ? "error" : "success",
        });
      })
      .catch((error) => {
        toast({ title: "Role Update Failed", description: `Error: ${error.message}`, category: "error" });
      }).finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
     <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <div className="flex justify-between items-center w-[81vw]">
              <BreadcrumbItem>
                <BreadcrumbPage className="text-lg">
                  Roles & Permissions
                </BreadcrumbPage>
              </BreadcrumbItem>
            </div>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="w-full flex justify-center items-center">
              <span className="text-lg font-semibold mr-4">Roles</span>
              <Select
                onValueChange={(value) => {
                  const selectedRole = roles.find((role) => role.id === value);
                  setRole(selectedRole);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder="Select a Role"
                    className="text-lg"
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem
                      className="hover:bg-accent/50 text-lg"
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
          

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <FormLabel className="text-2xl flex">Permissions {loading&&<Spinner className="ml-2"/>}</FormLabel>
                  <FormDescription>Select permissions for this role.</FormDescription>

                  {items.map((item) => (
                    <FormField key={item.name} control={form.control} name="items" render={() => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={form.watch("items").includes(item.name)}
                            onCheckedChange={(checked) => {
                              const values = form.getValues("items");
                              form.setValue(
                                "items",
                                checked ? [...values, item.name] : values.filter((v) => v !== item.name)
                              );
                            }}
                          />
                        </FormControl>
                        <FormLabel>{item.label}</FormLabel>
                      </FormItem>
                    )} />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            { permissions.create && <Button type="submit" className="rounded-xl">Submit</Button>}
              {/* <Button type="submit" className="rounded-xl">Submit</Button>} */}
          </form>
        </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Permissions;
