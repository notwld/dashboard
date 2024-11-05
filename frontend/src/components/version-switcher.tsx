import * as React from "react"
import { Check, ChevronsUpDown, GalleryVerticalEnd, User2Icon, UserIcon, UserRound, UsersRound } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/Sidebar/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/Sidebar/sidebar"
import { Separator } from "./ui/Sidebar/separator"
import { Link } from "react-router-dom"
import logo from "../assets/logo.png"
export function VersionSwitcher({
  versions,
  defaultVersion,
}: {
  versions: string[]
  defaultVersion: string
}) {
  const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Link to={"/"} className="flex gap-2 items-center justify-center">
            <div className="flex aspect-square size-16 items-center justify-center rounded-lg text-sidebar-primary-foreground">

              <img src={logo} alt="logo" className="w-16 h-8 object-contain" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              {/* <span className="">v{selectedVersion}</span> */}
              <span className="font-semibold text-xl ">devmize.</span>
            </div>
          </Link>
          {/* <ChevronsUpDown className="ml-auto" /> */}
        </SidebarMenuButton>
        <Separator orientation="horizontal" className="mr-2 h-[0.1px mt-2 bg-gray-800" />

      </SidebarMenuItem>
    </SidebarMenu>
  )
}
