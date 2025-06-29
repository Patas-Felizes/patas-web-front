// src/hooks/usePets.js
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

export const usePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar todos os pets
  const loadPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const petsData = await getAllPets();
      setPets(petsData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar pets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar pets com filtros
  const searchPetsWithFilters = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const petsData = await searchPets(filters);
      setPets(petsData);
    } catch (err) {
      setError(err.message);
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo pet
  const createPet = async (petData, imageFile = null) => {
    setLoading(true);
    setError(null);
    try {
      let imageUrl = '';
      
      // Se há arquivo de imagem, fazer upload primeiro
      if (imageFile) {
        // Criar um ID temporário para o upload
        const tempId = `temp_${Date.now()}`;
        imageUrl = await uploadPetImage(imageFile, tempId);
      }

      // Preparar dados do pet
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

      const newPet = await addPet(petToSave);
      
      // Atualizar lista local
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

  // Atualizar pet existente
  const editPet = async (petId, petData, imageFile = null) => {
    setLoading(true);
    setError(null);
    try {
      let imageUrl = petData.foto || '';
      
      // Se há novo arquivo de imagem, fazer upload
      if (imageFile) {
        imageUrl = await uploadPetImage(imageFile, petId);
      }

      // Preparar dados atualizados
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
      
      // Atualizar lista local
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

  // Remover pet
  const removePet = async (petId) => {
    setLoading(true);
    setError(null);
    try {
      // Buscar dados do pet para deletar imagem
      const pet = pets.find(p => p.id === petId);
      
      // Deletar pet do Firestore
      await deletePet(petId);
      
      // Deletar imagem se existir
      if (pet && pet.foto) {
        await deletePetImage(pet.foto);
      }
      
      // Atualizar lista local
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

  // Carregar pets na inicialização
  useEffect(() => {
    loadPets();
  }, []);

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

// Hook para um pet específico
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