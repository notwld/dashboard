import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Home from './app/dashboard/Home/index.tsx'
import Users from './app/dashboard/Users/index.tsx'
import UserCreateForm from './app/dashboard/Users/create-form.tsx'
import RoleCreateForm from './app/dashboard/Roles/create-form.tsx'
import { Roles } from './app/dashboard/Roles/index.tsx'

const routes = createBrowserRouter([
  {
    path:'/',
    element: <App />,
    children:[
      {
        path:'/',
        element:<Home />,
      },
      {
        path:'/users',
        element:<Users />,
      },
      {
        path:'/create-user',
        element:<UserCreateForm />,
      },
      {
        path:'/roles',
        element:<Roles />,
      },
      {
        path:'/create-role',
        element:<RoleCreateForm />,
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>,
)
