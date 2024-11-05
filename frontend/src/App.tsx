
import { Navigate, useLocation } from 'react-router-dom';
import Page from './app/dashboard/page'
import React from 'react';
import LoginPage from './app/dashboard/Login';

function App() {

  return (
   <div>
    <Page />
   </div>
  )
}


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
 
   return token ? (
     children
   ) : (
      <LoginPage />
   );
 };

export { ProtectedRoute, App }
