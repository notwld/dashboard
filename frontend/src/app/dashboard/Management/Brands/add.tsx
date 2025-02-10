import React, { useState } from 'react'
import { SidebarTrigger } from '../../../../components/ui/Sidebar/sidebar'
import { Separator } from '../../../../components/ui/Sidebar/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '../../../../components/ui/Sidebar/breadcrumb'
import { Button } from '../../../../components/ui/button'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '../../../../components/ui/Form/form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload, UploadCloud } from 'lucide-react'
import { Input } from '../../../../components/ui/Sidebar/input'
import { Label } from '../../../../components/ui/Sidebar/label'
import { baseurl } from '../../../../config/baseurl'

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Name must be at least 4 characters.",
  }),
  logo: z.instanceof(File).optional(),
  description: z.string().min(4, {
    message: "Description must be at least 4 characters.",
  }),
  stripeSecretKey: z.string().min(4, {
    message: "Stripe Secret Key must be at least 4 characters.",
  }),
  stripePublishableKey: z.string().min(4, {
    message: "Stripe Publishable Key must be at least 4 characters.",
  }),
});

export default function AddBrand() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('stripeSecretKey', data.stripeSecretKey)
      formData.append('stripePublishableKey', data.stripePublishableKey)
      
      if (data.logo) {
        formData.append('logo', data.logo)
      }

      const response = await fetch(`${baseurl}/brand/add`, {
        method: 'POST',
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      
      const json = await response.json()
      if (response.ok) {
        setLoading(false)
        navigate('/brands')
      } else {
        setLoading(false)
        console.log(json)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      logo: undefined,
      description: "",
      stripeSecretKey: "",
      stripePublishableKey: ""
    },
  })

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      form.setValue('logo', file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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
                  <div>Add Brand</div>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </div>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <div className='p-4 mt-6 mx-10'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-2 gap-6' encType="multipart/form-data">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brand name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-4">
                        <Input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          id="logo-upload"
                          onChange={handleLogoChange}
                        />
                        <Label
                          htmlFor="logo-upload" 
                          className="flex items-center space-x-2 cursor-pointer border rounded-md p-2 hover:bg-accent"
                        >
                          <UploadCloud className="mr-2 h-4 w-4" />
                          {logoPreview ? "Change Logo" : "Upload Logo"}
                        </Label>
                      </div>
                      {logoPreview && (
                        <div className="mt-2">
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="h-20 w-20 object-contain rounded-md border"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter brand description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stripeSecretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stripe Secret Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Stripe secret key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stripePublishableKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stripe Publishable Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Stripe publishable key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2 mt-4">
              <Button type='submit' disabled={loading}>
                {loading ? "Adding Brand..." : "Add Brand"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}