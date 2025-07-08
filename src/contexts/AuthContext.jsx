import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUserData } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getCurrentUserData(firebaseUser.uid);
          setUser(firebaseUser);
          setUserData(userDoc);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    isProtetor: userData?.tipoUsuario === 'protetor',
    isAdotante: userData?.tipoUsuario === 'adotante',
    setUser,
    setUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};