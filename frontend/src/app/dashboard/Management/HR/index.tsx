import React, { useState } from 'react'
import { SidebarTrigger } from '../../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
export default function HR() {
  return (
    <div><header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
    <SidebarTrigger className="-ml-1" />
    <Separator orientation="vertical" className="mr-2 h-4" />
    <Breadcrumb>
        <BreadcrumbList>

            <div className="flex justify-between items-center w-[81vw]">
                <BreadcrumbItem className='flex w-full justify-between items-center'>
                    <BreadcrumbPage className="flex justify-between items-center text-lg w-full">
                        <div>
                            HR Management
                        </div>
                        {/* {permissions.create && <div>

                            <Button className="ml-4 rounded-xl"
                                onClick={() => {
                                    navigate('/create-role')
                                }}
                            >Create a Role</Button>
                        </div>} */}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </div>
        </BreadcrumbList>
    </Breadcrumb>

</header></div>
  )
}
