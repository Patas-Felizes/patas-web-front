import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';

const OngProtectedRoute = ({ children }) => {
  const { userData } = useAuth();
  const { hasSelectedOng } = useOng();

  if (userData?.tipoUsuario === 'adotante') {
    return children;
  }

  if (userData?.tipoUsuario === 'protetor' && !hasSelectedOng) {
    return <Navigate to="/select-ong" replace />;
  }

  return children;
};

export default OngProtectedRoute;