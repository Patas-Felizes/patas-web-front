// src/services/firebase.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Coleção de pets no Firestore
const PETS_COLLECTION = 'pets';

// ==================== FUNÇÕES PARA PETS ====================

// Buscar todos os pets
export const getAllPets = async () => {
  try {
    const petsRef = collection(db, PETS_COLLECTION);
    const q = query(petsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const pets = [];
    querySnapshot.forEach((doc) => {
      pets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return pets;
  } catch (error) {
    console.error('Erro ao buscar pets:', error);
    throw new Error('Falha ao carregar pets');
  }
};

// Buscar pet por ID
export const getPetById = async (petId) => {
  try {
    const petRef = doc(db, PETS_COLLECTION, petId);
    const petSnap = await getDoc(petRef);
    
    if (petSnap.exists()) {
      return {
        id: petSnap.id,
        ...petSnap.data()
      };
    } else {
      throw new Error('Pet não encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar pet:', error);
    throw error;
  }
};

// Adicionar novo pet
export const addPet = async (petData) => {
  try {
    const petWithTimestamp = {
      ...petData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, PETS_COLLECTION), petWithTimestamp);
    
    return {
      id: docRef.id,
      ...petWithTimestamp
    };
  } catch (error) {
    console.error('Erro ao adicionar pet:', error);
    throw new Error('Falha ao cadastrar pet');
  }
};

// Atualizar pet
export const updatePet = async (petId, petData) => {
  try {
    const petRef = doc(db, PETS_COLLECTION, petId);
    const updatedData = {
      ...petData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(petRef, updatedData);
    
    return {
      id: petId,
      ...updatedData
    };
  } catch (error) {
    console.error('Erro ao atualizar pet:', error);
    throw new Error('Falha ao atualizar pet');
  }
};

// Deletar pet
export const deletePet = async (petId) => {
  try {
    const petRef = doc(db, PETS_COLLECTION, petId);
    await deleteDoc(petRef);
    
    return petId;
  } catch (error) {
    console.error('Erro ao deletar pet:', error);
    throw new Error('Falha ao remover pet');
  }
};

// Buscar pets por filtros
export const searchPets = async (filters = {}) => {
  try {
    let q = collection(db, PETS_COLLECTION);
    
    // Aplicar filtros
    if (filters.especie) {
      q = query(q, where('especie', '==', filters.especie));
    }
    
    if (filters.sexo) {
      q = query(q, where('sexo', '==', filters.sexo));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    // Ordenar por data de criação
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const pets = [];
    
    querySnapshot.forEach((doc) => {
      pets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return pets;
  } catch (error) {
    console.error('Erro na busca de pets:', error);
    throw new Error('Falha na busca');
  }
};

// ==================== FUNÇÕES PARA UPLOAD DE IMAGENS ====================

// Upload de imagem para Firebase Storage
export const uploadPetImage = async (file, petId) => {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `${petId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `pets/${fileName}`);
    
    // Upload do arquivo
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obter URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    throw new Error('Falha no upload da imagem');
  }
};

// Deletar imagem do Firebase Storage
export const deletePetImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;
    
    // Extrair o path da imagem da URL
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    // Não lançar erro aqui pois a imagem pode já ter sido deletada
  }
};

// ==================== FUNÇÕES PARA SOLICITAÇÕES DE ADOÇÃO ====================

const ADOPTION_REQUESTS_COLLECTION = 'adoptionRequests';

// Criar solicitação de adoção
export const createAdoptionRequest = async (adoptionData) => {
  try {
    const requestWithTimestamp = {
      ...adoptionData,
      status: 'pendente',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, ADOPTION_REQUESTS_COLLECTION), requestWithTimestamp);
    
    return {
      id: docRef.id,
      ...requestWithTimestamp
    };
  } catch (error) {
    console.error('Erro ao criar solicitação de adoção:', error);
    throw new Error('Falha ao solicitar adoção');
  }
};

// Buscar solicitações de adoção
export const getAdoptionRequests = async () => {
  try {
    const requestsRef = collection(db, ADOPTION_REQUESTS_COLLECTION);
    const q = query(requestsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return requests;
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    throw new Error('Falha ao carregar solicitações');
  }
};

// Atualizar status da solicitação de adoção
export const updateAdoptionRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, ADOPTION_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return { id: requestId, status };
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    throw new Error('Falha ao atualizar solicitação');
  }
};