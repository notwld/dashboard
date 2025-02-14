import React, { useEffect, useState } from 'react'
import { SidebarTrigger } from '../../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../../components/ui/button'
import { useNavigate } from 'react-router-dom'
import { baseurl } from '../../../../config/baseurl'

export default function Brands() {
    const navigate = useNavigate()
    const [brands, setBrands] = useState([
    ])
    const fetchBrands = async () => {
        await fetch(baseurl + '/brand/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': `Bearer ${localStorage.getItem('token')}`
            }
        }).then((res) => res.json())
            .then((data) => {
                setBrands(data)
            })
            .catch((err) => console.log(err))
    }
    useEffect(() => {
        fetchBrands()
    }
        , []);
        const [permissions, setPermissions] = React.useState({
                    add: false,
                });
                const checkPermissions = async () => {
                    const res = await fetch(baseurl + `/user/get-user`, {
                        method: 'GET',
                        headers: {
                            "x-access-token": `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        }
                        
                    })
                    let permissionObj = await res.json();
                    permissionObj = permissionObj.role.permissions;
                    console.log(permissionObj)
                    if (permissionObj) {
                        const permissionArray = ["Add Brands"];
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
                            {permissions.add&& <div className='flex gap-4'>
                                <Button onClick={() => navigate('/brands/add')}>
                                    Add Brand
                                </Button>
                            </div>}

                        </div>
                    </BreadcrumbList>
                </Breadcrumb>

            </header>
            <div className='grid grid-cols-3 gap-4 p-4 mt-6 mx-10'>
                {brands.map((brand, index) => (
                    <div key={index} className='flex gap-4 items-center hover:bg-white hover:text-black p-4 rounded-lg shadow-md transition-all cursor-pointer ring-1 ring-gray-600'>
                        <div className='w-20 h-20 rounded-full'>
                            <img src={`${baseurl}/${brand.logo}`} alt="Brand Logo" className='w-full h-full object-contain' />
                        </div>
                        <div>
                            <h1 className='font-bold text-lg'>{brand.name}</h1>
                            <p>{brand.description}</p>
                        </div>
                        <div className='flex gap-2 justify-end items-center'>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
