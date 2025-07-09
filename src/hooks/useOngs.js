import { useState, useEffect } from 'react';
import {
  getOngsByUser,
  getOngById,
  createOng,
  updateOng,
  deleteOng
} from '../services/ongs';
import { useAuth } from '../contexts/AuthContext';

export const useOngs = () => {
  const { user } = useAuth();
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOngs = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const ongsData = await getOngsByUser(user.uid);
      setOngs(ongsData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar ONGs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewOng = async (ongData) => {
    setLoading(true);
    setError(null);
    try {
      const newOng = await createOng(ongData, user.uid);
      setOngs(prevOngs => [newOng, ...prevOngs]);
      return newOng;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao criar ONG:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editOng = async (ongId, ongData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedOng = await updateOng(ongId, ongData);
      setOngs(prevOngs =>
        prevOngs.map(ong => (ong.id === ongId ? { ...ong, ...updatedOng } : ong))
      );
      return updatedOng;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar ONG:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeOng = async (ongId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteOng(ongId);
      setOngs(prevOngs => prevOngs.filter(ong => ong.id !== ongId));
      return ongId;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao remover ONG:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOngs();
    }
  }, [user]);

  return {
    ongs,
    loading,
    error,
    loadOngs,
    createNewOng,
    editOng,
    removeOng,
    clearError: () => setError(null)
  };
};

export const useOng = (ongId) => {
  const [ong, setOng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOng = async () => {
    if (!ongId) return;
    
    setLoading(true);
    setError(null);
    try {
      const ongData = await getOngById(ongId);
      setOng(ongData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar ONG:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOng();
  }, [ongId]);

  return {
    ong,
    loading,
    error,
    refetch: loadOng,
    clearError: () => setError(null)
  };
};