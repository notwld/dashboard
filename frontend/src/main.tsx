import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { createBrowserRouter,RouterProvider} from 'react-router-dom'
import Index from './pages/Index.tsx'
import RootBoundary from './components/ErrorBoundary.tsx'

const routes = createBrowserRouter([
  {
    path:'/',
    element:<App />,
    errorElement:<RootBoundary />,
    children:[
      {
        path:'/home',
        element:<Index />
      }
    ]
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>
)
