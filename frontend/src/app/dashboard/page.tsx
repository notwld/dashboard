

import { Outlet } from "react-router-dom"
import { AppSidebar } from "../../components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../../components/ui/Sidebar/breadcrumb"
import { Separator } from "../../components/ui/Sidebar/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../../components/ui/Sidebar/sidebar"
import { Toaster } from "../../components/ui/Toast/toaster"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
        <Toaster />

      </SidebarInset>
    </SidebarProvider>
  )
}
