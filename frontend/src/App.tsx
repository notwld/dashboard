
import { Navigate, useLocation } from 'react-router-dom';
import Page from './app/dashboard/page'
import React, { useEffect, useState } from 'react';
import LoginPage from './app/dashboard/Login';
import { baseurl } from './config/baseurl';

function App() {

  return (
   <div>
    <Page />
   </div>
  )
}

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(baseurl + "/get-session", {
          method: "GET",
          headers: {
            "x-access-token": `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        console.log(data)
        if (data && data === token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, [token]);

  if (isAuthenticated === null) {
    return null; 
  }

  return isAuthenticated ? children : <LoginPage />;
};

export { ProtectedRoute, App }
