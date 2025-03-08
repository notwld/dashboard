import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App,ProtectedRoute} from './App.tsx'
import { createBrowserRouter,RouterProvider} from 'react-router-dom'
import Home from './app/dashboard/Home/index.tsx'
import Users from './app/dashboard/Users/index.tsx'
import UserCreateForm from './app/dashboard/Users/create-form.tsx'
import RoleCreateForm from './app/dashboard/Roles/create-form.tsx'
import { Roles } from './app/dashboard/Roles/index.tsx'
import Permissions from './app/dashboard/Perms/index.tsx'
import ManageLeads from './app/dashboard/Leads/index.tsx'
import LeadCreateFormPage from './app/dashboard/Leads/create-form.tsx'
import LoginPage from './app/dashboard/Login/index.tsx'
import Attendance from './app/dashboard/Attedance/index.tsx'
import CreatePaymentLink from './app/dashboard/PaymentLink/create.tsx'
import Brands from './app/dashboard/Management/Brands/index.tsx'
import HR from './app/dashboard/Management/HR/index.tsx'
import AddBrand from './app/dashboard/Management/Brands/add.tsx'
import { Mail } from './app/dashboard/Email/mail.tsx'
import MailPage from './app/dashboard/Email/index.tsx'

 

const routes = createBrowserRouter([
  {
    path:'/',
    element: <ProtectedRoute><App /></ProtectedRoute>,
    children:[
      {
        path:'/',
        element:<ProtectedRoute><Home /></ProtectedRoute>,
      },
      {
        path:'/dashboard',
        element:<ProtectedRoute><Home /></ProtectedRoute>,
      },
      {
        path:'/brands',
        element:<ProtectedRoute><Brands /></ProtectedRoute>,
      },
      {
        path:"/brands/add",
        element:<ProtectedRoute><AddBrand /></ProtectedRoute>
      },
      {
        path:'/hr',
        element:<ProtectedRoute><HR /></ProtectedRoute>,
      },
      {
        path:'/attendance',
        element:<ProtectedRoute><Attendance /></ProtectedRoute>,
      },
      {
        path:'/create-link',
        element:<ProtectedRoute><CreatePaymentLink /></ProtectedRoute>,
      },
      {
        path:'/users',
        element:<ProtectedRoute><Users /></ProtectedRoute>,
      },
      {
        path:'/create-user',
        element:<ProtectedRoute><UserCreateForm /></ProtectedRoute>,
      },
      {
        path:'/roles',
        element:<ProtectedRoute><Roles /></ProtectedRoute>,
      },
      {
        path:'/create-role',
        element:<ProtectedRoute><RoleCreateForm /></ProtectedRoute>,
      },
      {
        path:'/permissions',
        element:<ProtectedRoute><Permissions /></ProtectedRoute>,
      },
      {
        path:'/leads',
        element:<ProtectedRoute><ManageLeads /></ProtectedRoute>,
      },
      {
        path:'/create-lead',
        element:<ProtectedRoute><LeadCreateFormPage /></ProtectedRoute>,
      },
      {
        path:'/login',
        element:<LoginPage />,
      },
      {
        path:"/email",
        element:<ProtectedRoute><MailPage /></ProtectedRoute>
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>,
)
