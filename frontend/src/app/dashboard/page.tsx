

import { Outlet, useLocation } from "react-router-dom"
import { AppSidebar } from "../../components/app-sidebar"

import { SidebarInset, SidebarProvider } from "../../components/ui/Sidebar/sidebar"
import { Toaster } from "../../components/ui/Toast/toaster"

export default function Page() {
  const location = useLocation()
  return (
    <SidebarProvider>
      {location.pathname !== "/login" && <AppSidebar />}
      <SidebarInset>
        <Outlet />
        <Toaster />

      </SidebarInset>
    </SidebarProvider>
  )
}
