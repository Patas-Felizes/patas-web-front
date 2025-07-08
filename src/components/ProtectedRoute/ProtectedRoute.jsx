import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredUserType && userData?.tipoUsuario !== requiredUserType) {
    if (userData?.tipoUsuario === 'protetor') {
      return <Navigate to="/" replace />;
    } else if (userData?.tipoUsuario === 'adotante') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;