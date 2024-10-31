import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Page from './app/dashboard/page.tsx'
import Home from './app/dashboard/Home/index.tsx'
import Users from './app/dashboard/Users/index.tsx'
import FormPage from './app/dashboard/Form/index.tsx'

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
        element:<FormPage />,
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>,
)
