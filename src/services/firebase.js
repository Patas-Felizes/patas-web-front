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
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

const PETS_COLLECTION = 'pets';
const PROCEDURES_COLLECTION = 'procedimentos'; 

export const getAllPets = async (ongId = null) => {
  try {
    const petsRef = collection(db, PETS_COLLECTION);
    let q;
    
    if (ongId) {
      q = query(
        petsRef, 
        where('ongId', '==', ongId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        petsRef,
        where('status', '==', 'Para adoção'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);

    const pets = [];
    querySnapshot.forEach((doc) => {
      pets.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return pets;
  } catch (error) {
    console.error('Erro ao buscar pets:', error);
    throw new Error('Falha ao carregar pets');
  }
};

export const getPetById = async (petId) => {
  try {
    const petRef = doc(db, PETS_COLLECTION, petId);
    const petSnap = await getDoc(petRef);

    if (petSnap.exists()) {
      return {
        id: petSnap.id,
        ...petSnap.data(),
      };
    } else {
      throw new Error('Pet não encontrado');
    }
  } catch (error) {
    console.error('Erro ao buscar pet:', error);
    throw error;
  }
};

export const addPet = async (petData, ongId) => {
  try {
    const petWithTimestamp = {
      ...petData,
      ongId, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, PETS_COLLECTION),
      petWithTimestamp,
    );

    return {
      id: docRef.id,
      ...petWithTimestamp,
    };
  } catch (error) {
    console.error('Erro ao adicionar pet:', error);
    throw new Error('Falha ao cadastrar pet');
  }
};

export const updatePet = async (petId, petData) => {
  try {
    const petRef = doc(db, PETS_COLLECTION, petId);
    const updatedData = {
      ...petData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(petRef, updatedData);

    return {
      id: petId,
      ...updatedData,
    };
  } catch (error) {
    console.error('Erro ao atualizar pet:', error);
    throw new Error('Falha ao atualizar pet');
  }
};

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

export const searchPets = async (filters = {}, ongId = null) => {
  try {
    const petsRef = collection(db, PETS_COLLECTION);
    let constraints = [];

    if (ongId) {
      constraints.push(where('ongId', '==', ongId));
    } else {
      constraints.push(where('status', '==', 'Para adoção'));
    }

    if (filters.especie) {
      constraints.push(where('especie', '==', filters.especie));
    }

    if (filters.sexo) {
      constraints.push(where('sexo', '==', filters.sexo));
    }

    if (filters.status && ongId) {
      constraints.push(where('status', '==', filters.status));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(petsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    const pets = [];

    querySnapshot.forEach((doc) => {
      pets.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return pets;
  } catch (error) {
    console.error('Erro na busca de pets:', error);
    throw new Error('Falha na busca');
  }
};

export const uploadPetImage = async (file, petId) => {
  try {
    const timestamp = Date.now();
    const fileName = `${petId}_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `pets/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    throw new Error('Falha no upload da imagem');
  }
};

export const deletePetImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
  }
};

export const getProceduresByPetId = async (petId) => {
  try {
    const proceduresRef = collection(db, PROCEDURES_COLLECTION);
    const q = query(
      proceduresRef,
      where('id_animal', '==', petId),
      orderBy('data_realizacao', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    const procedures = [];
    querySnapshot.forEach((doc) => {
      procedures.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return procedures;
  } catch (error) {
    console.error('Erro ao buscar procedimentos:', error);
    throw new Error('Falha ao carregar procedimentos');
  }
};

export const addProcedure = async (procedureData) => {
  try {
    const procedureWithTimestamp = {
      ...procedureData,
      data_realizacao: new Date(procedureData.data_realizacao),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(
      collection(db, PROCEDURES_COLLECTION),
      procedureWithTimestamp,
    );
    return {
      id: docRef.id,
      ...procedureWithTimestamp,
    };
  } catch (error) {
    console.error('Erro ao adicionar procedimento:', error);
    throw new Error('Falha ao cadastrar procedimento');
  }
};

export const updateProcedure = async (procedureId, procedureData) => {
  try {
    const procedureRef = doc(db, PROCEDURES_COLLECTION, procedureId);
    const updatedData = {
      ...procedureData,
      data_realizacao: new Date(procedureData.data_realizacao),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(procedureRef, updatedData);
    return {
      id: procedureId,
      ...updatedData,
    };
  } catch (error) {
    console.error('Erro ao atualizar procedimento:', error);
    throw new Error('Falha ao atualizar procedimento');
  }
};

export const deleteProcedure = async (procedureId) => {
  try {
    const procedureRef = doc(db, PROCEDURES_COLLECTION, procedureId);
    await deleteDoc(procedureRef);
    return procedureId;
  } catch (error) {
    console.error('Erro ao deletar procedimento:', error);
    throw new Error('Falha ao remover procedimento');
  }
};

const ADOPTION_REQUESTS_COLLECTION = 'solicitacoesAdocao';

export const createAdoptionRequestWithForm = async (adoptionData) => {
  try {
    const requestWithTimestamp = {
      ...adoptionData,
      status: 'em_espera',
      dataEnvio: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(
      collection(db, ADOPTION_REQUESTS_COLLECTION),
      requestWithTimestamp,
    );
    
    return {
      id: docRef.id,
      ...requestWithTimestamp,
    };
  } catch (error) {
    console.error('Erro ao criar solicitação de adoção:', error);
    throw new Error('Falha ao enviar solicitação de adoção');
  }
};

export const getAdoptionRequestsByAdotante = async (adotanteId) => {
  try {
    const requestsRef = collection(db, ADOPTION_REQUESTS_COLLECTION);
    const q = query(
      requestsRef,
      where('idAdotante', '==', adotanteId),
      orderBy('dataEnvio', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return requests;
  } catch (error) {
    console.error('Erro ao buscar solicitações do adotante:', error);
    throw new Error('Falha ao carregar suas solicitações');
  }
};

export const getAdoptionRequestsByOng = async (ongId) => {
  try {
    const requestsRef = collection(db, ADOPTION_REQUESTS_COLLECTION);
    const q = query(
      requestsRef,
      where('idOng', '==', ongId),
      orderBy('dataEnvio', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return requests;
  } catch (error) {
    console.error('Erro ao buscar solicitações da ONG:', error);
    throw new Error('Falha ao carregar solicitações da ONG');
  }
};

export const updateAdoptionRequestStatusWithResponse = async (requestId, status, responseMessage = '') => {
  try {
    const requestRef = doc(db, ADOPTION_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status,
      responseMessage,
      responseDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { id: requestId, status, responseMessage };
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    throw new Error('Falha ao atualizar solicitação');
  }
};

export const uploadAdoptionPhotos = async (files, requestId) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const fileName = `${requestId}_ambiente_${index}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `adoption_photos/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Erro no upload das fotos:', error);
    throw new Error('Falha no upload das fotos dos ambientes');
  }
};

export const deleteAdoptionRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'solicitacoesAdocao', requestId);
    await deleteDoc(requestRef);
    return requestId;
  } catch (error) {
    console.error('Erro ao deletar solicitação:', error);
    throw new Error('Falha ao excluir solicitação');
  }
};