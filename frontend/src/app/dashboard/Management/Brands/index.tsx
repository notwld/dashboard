import React, { useState } from 'react'
import { SidebarTrigger } from '../../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Brands() {
    const [brands, setBrands] = useState([
        {
            name: 'designtech360',
            logo:"http://localhost:5173/src/assets/logo.png",
            description: 'This is a description of brand 1'
        },
        {
            name: 'mizetechnologies',
            logo:"http://localhost:5173/src/assets/logo.png",
            description: 'This is a description of brand 2'
        },
        {
            name: 'Brand 3',
            logo:"http://localhost:5173/src/assets/logo.png",
            description: 'This is a description of brand 3'
        }
    ])
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
                                        Brands
                                    </div>

                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </div>
                    </BreadcrumbList>
                </Breadcrumb>

            </header>
            <div className='grid grid-cols-3 gap-4 p-4 mt-6 mx-10'>
                {brands.map((brand, index) => (
                    <div key={index} className='flex gap-4 items-center'>
                        <div className='w-20 h-20 rounded-full'>
                            <img src={brand.logo} alt="logo" className='w-full h-full object-contain' />
                        </div>
                        <div>
                            <h1 className='font-bold text-lg'>{brand.name}</h1>
                            <p>{brand.description}</p>
                        </div>
                    </div>
                ))}
                </div>
        </div>
    )
}
