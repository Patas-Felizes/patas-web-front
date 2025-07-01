import { useState, useEffect } from 'react';
import {
  getProceduresByPetId,
  addProcedure,
  updateProcedure,
  deleteProcedure,
} from '../services/firebase';

export const useProcedures = (petId) => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProcedures = async () => {
    if (!petId) return;

    setLoading(true);
    setError(null);
    try {
      const proceduresData = await getProceduresByPetId(petId);
      setProcedures(proceduresData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar procedimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProcedure = async (procedureData) => {
    setLoading(true);
    setError(null);
    try {
      const newProcedure = await addProcedure({ ...procedureData, id_animal: petId });
      setProcedures((prevProcedures) => [newProcedure, ...prevProcedures]);
      return newProcedure;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao criar procedimento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editProcedure = async (procedureId, procedureData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProcedure = await updateProcedure(procedureId, procedureData);
      setProcedures((prevProcedures) =>
        prevProcedures.map((proc) =>
          proc.id === procedureId ? { ...proc, ...updatedProcedure } : proc,
        ),
      );
      return updatedProcedure;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar procedimento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeProcedure = async (procedureId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProcedure(procedureId);
      setProcedures((prevProcedures) =>
        prevProcedures.filter((proc) => proc.id !== procedureId),
      );
      return procedureId;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao remover procedimento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcedures();
  }, [petId]); 

  return {
    procedures,
    loading,
    error,
    loadProcedures, 
    createProcedure,
    editProcedure,
    removeProcedure,
    clearError: () => setError(null),
  };
};