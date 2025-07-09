import React, { createContext, useContext, useState, useEffect } from 'react';

const OngContext = createContext();

export const useOng = () => {
  const context = useContext(OngContext);
  if (!context) {
    throw new Error('useOng deve ser usado dentro de um OngProvider');
  }
  return context;
};

export const OngProvider = ({ children }) => {
  const [selectedOng, setSelectedOng] = useState(null);

  // Salvar ONG selecionada no localStorage
  useEffect(() => {
    if (selectedOng) {
      localStorage.setItem('selectedOng', JSON.stringify(selectedOng));
    }
  }, [selectedOng]);

  // Carregar ONG selecionada do localStorage
  useEffect(() => {
    const storedOng = localStorage.getItem('selectedOng');
    if (storedOng) {
      try {
        setSelectedOng(JSON.parse(storedOng));
      } catch (error) {
        console.error('Erro ao carregar ONG do storage:', error);
        localStorage.removeItem('selectedOng');
      }
    }
  }, []);

  const selectOng = (ong) => {
    setSelectedOng(ong);
  };

  const clearSelectedOng = () => {
    setSelectedOng(null);
    localStorage.removeItem('selectedOng');
  };

  const value = {
    selectedOng,
    selectOng,
    clearSelectedOng,
    hasSelectedOng: !!selectedOng
  };

  return (
    <OngContext.Provider value={value}>
      {children}
    </OngContext.Provider>
  );
};