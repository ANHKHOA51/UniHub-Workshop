import React from 'react';
import { Navigate, useLocation } from 'react-router';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const location = useLocation();

  if (!token || !userJson) {
    // Not logged in, redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userJson);
    const userRole = user.role?.toLowerCase();

    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
      // Role not authorized, redirect to home page
      return <Navigate to="/workshops" replace />;
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage', error);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
