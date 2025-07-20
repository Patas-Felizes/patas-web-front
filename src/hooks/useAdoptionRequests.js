import { useState, useEffect, useCallback } from 'react';
import {
  createAdoptionRequestWithForm,
  getAdoptionRequestsByAdotante,
  getAdoptionRequestsByOng,
  updateAdoptionRequestStatusWithResponse,
  uploadAdoptionPhotos
} from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useOng } from '../contexts/OngContext';

export const useAdoptionRequests = () => {
  const { userData } = useAuth();
  const { selectedOng } = useOng();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isProtetor = userData?.tipoUsuario === 'protetor';

  const loadRequests = useCallback(async () => {
    if (!userData) return;
    
    setLoading(true);
    setError(null);
    try {
      let requestsData = [];
      if (isProtetor && selectedOng) {
        requestsData = await getAdoptionRequestsByOng(selectedOng.id);
      } else if (!isProtetor) {
        requestsData = await getAdoptionRequestsByAdotante(userData.uid);
      }
      
      setRequests(requestsData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar solicitações:', err);
    } finally {
      setLoading(false);
    }
  }, [userData, selectedOng, isProtetor]);

  const createRequest = async (requestData, photoFiles = []) => {
    setLoading(true);
    setError(null);
    try {
      let fotosAmbiente = [];
      if (photoFiles.length > 0) {
        const tempId = `temp_${Date.now()}`;
        fotosAmbiente = await uploadAdoptionPhotos(photoFiles, tempId);
      }

      const requestWithPhotos = {
        ...requestData,
        fotosAmbiente
      };

      const newRequest = await createAdoptionRequestWithForm(requestWithPhotos);
      setRequests(prevRequests => [newRequest, ...prevRequests]);
      return newRequest;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao criar solicitação:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status, responseMessage = '') => {
    setLoading(true);
    setError(null);
    try {
      await updateAdoptionRequestStatusWithResponse(requestId, status, responseMessage);
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId
            ? { ...request, status, responseMessage, responseDate: new Date() }
            : request
        )
      );
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (requestId) => {
  setLoading(true);
  setError(null);
  try {
    await deleteAdoptionRequest(requestId);
    setRequests(prevRequests => 
      prevRequests.filter(request => request.id !== requestId)
    );
  } catch (err) {
    setError(err.message);
    console.error('Erro ao excluir solicitação:', err);
    throw err;
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (userData && (!isProtetor || (isProtetor && selectedOng))) {
      loadRequests();
    }
  }, [loadRequests]);

  return {
    requests,
    loading,
    error,
    loadRequests,
    createRequest,
    updateRequestStatus,
    deleteRequest,
    clearError: () => setError(null)
  };
};