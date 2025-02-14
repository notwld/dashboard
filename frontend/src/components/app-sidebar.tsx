import * as React from "react"
import { VersionSwitcher } from "../components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../components/ui/Sidebar/sidebar"
import { Link } from "react-router-dom"

const data = {
  versions: [],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      items: [
        {
          title: "Stats",
          url: "/",
        },
        {
          title: "Attendance",
          url: "/attendance",
        },

      ],
    },
    {
      title: "Management",
      url: "#",
      items: [
        {
          title: "Brands (WIP)",
          url: "/brands",
        },
        {
          title: "HR Management",
          url: "/hr",
        },

      ],
    },
    {
      title: "Access Control",
      url: "#",
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "Roles",
          url: "/roles",
        },
        {
          title: "Permissions",
          url: "/permissions",
        },
      ],
    },
    {
      title: "Leads",
      url: "#",
      items: [
        {
          title: "Manage Leads",
          url: "/leads",
        },

      ],
    },
    {
      title: "Payment Link",
      url: "#",
      items: [

        {
          title: "Create Link  (WIP)",
          url: "/create-link",
        },
      ],
    },



  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="text-lg">{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title} className="text-xl">
                    <SidebarMenuButton asChild>
                      <Link to={item.url}><span className="text-lg">
                        {item.title}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
