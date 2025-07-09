import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOng } from '../../contexts/OngContext';

const OngProtectedRoute = ({ children }) => {
  const { userData } = useAuth();
  const { hasSelectedOng } = useOng();

  // Se for adotante, não precisa de ONG selecionada
  if (userData?.tipoUsuario === 'adotante') {
    return children;
  }

  // Se for protetor e não tem ONG selecionada, redireciona para seleção
  if (userData?.tipoUsuario === 'protetor' && !hasSelectedOng) {
    return <Navigate to="/select-ong" replace />;
  }

  return children;
};

export default OngProtectedRoute;