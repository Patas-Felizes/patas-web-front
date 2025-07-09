import { useState, useEffect } from 'react';
import {
  getAllPets,
  getPetById,
  addPet,
  updatePet,
  deletePet,
  searchPets,
  uploadPetImage,
  deletePetImage
} from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useOng } from '../contexts/OngContext';

export const usePets = () => {
  const { userData } = useAuth();
  const { selectedOng } = useOng();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isProtetor = userData?.tipoUsuario === 'protetor';
  const ongId = isProtetor ? selectedOng?.id : null;

  const loadPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const petsData = await getAllPets(ongId);
      setPets(petsData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchPetsWithFilters = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const petsData = await searchPets(filters, ongId);
      setPets(petsData);
    } catch (err) {
      setError(err.message);
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPet = async (petData, imageFile = null) => {
    if (isProtetor && !ongId) {
      throw new Error('Nenhuma ONG selecionada');
    }

    setLoading(true);
    setError(null);
    try {
      let imageUrl = '';
      
      if (imageFile) {
        const tempId = `temp_${Date.now()}`;
        imageUrl = await uploadPetImage(imageFile, tempId);
      }

      const petToSave = {
        nome: petData.nome,
        especie: petData.especie,
        idade: {
          valor: parseInt(petData.idadeValor),
          unidade: petData.idadeUnidade
        },
        sexo: petData.sexo,
        castracao: petData.castracao === 'true',
        status: petData.status,
        descricao: petData.descricao || '',
        foto: imageUrl
      };

      const newPet = await addPet(petToSave, ongId);
      
      setPets(prevPets => [newPet, ...prevPets]);
      
      return newPet;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao criar pet:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editPet = async (petId, petData, imageFile = null) => {
    setLoading(true);
    setError(null);
    try {
      let imageUrl = petData.foto || '';
      
      if (imageFile) {
        imageUrl = await uploadPetImage(imageFile, petId);
      }

      const updatedData = {
        nome: petData.nome,
        especie: petData.especie,
        idade: {
          valor: parseInt(petData.idadeValor),
          unidade: petData.idadeUnidade
        },
        sexo: petData.sexo,
        castracao: petData.castracao === 'true',
        status: petData.status,
        descricao: petData.descricao || '',
        foto: imageUrl
      };

      const updatedPet = await updatePet(petId, updatedData);
      
      setPets(prevPets =>
        prevPets.map(pet => (pet.id === petId ? { ...pet, ...updatedPet } : pet))
      );
      
      return updatedPet;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar pet:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePet = async (petId) => {
    setLoading(true);
    setError(null);
    try {
      const pet = pets.find(p => p.id === petId);
      
      await deletePet(petId);
      
      if (pet && pet.foto) {
        await deletePetImage(pet.foto);
      }
      
      setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
      
      return petId;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao remover pet:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Para protetores, só carrega se tiver ONG selecionada
    // Para adotantes, carrega sempre
    if (!isProtetor || (isProtetor && ongId)) {
      loadPets();
    }
  }, [ongId, isProtetor]);

  return {
    pets,
    loading,
    error,
    loadPets,
    searchPetsWithFilters,
    createPet,
    editPet,
    removePet,
    clearError: () => setError(null)
  };
};

export const usePet = (petId) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPet = async () => {
    if (!petId) return;
    
    setLoading(true);
    setError(null);
    try {
      const petData = await getPetById(petId);
      setPet(petData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar pet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPet();
  }, [petId]);

  return {
    pet,
    loading,
    error,
    refetch: loadPet,
    clearError: () => setError(null)
  };
};