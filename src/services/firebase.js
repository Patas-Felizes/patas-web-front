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

export const getAllPets = async () => {
  try {
    const petsRef = collection(db, PETS_COLLECTION);
    const q = query(petsRef, orderBy('createdAt', 'desc'));
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

export const addPet = async (petData) => {
  try {
    const petWithTimestamp = {
      ...petData,
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

export const searchPets = async (filters = {}) => {
  try {
    let q = collection(db, PETS_COLLECTION);

    if (filters.especie) {
      q = query(q, where('especie', '==', filters.especie));
    }

    if (filters.sexo) {
      q = query(q, where('sexo', '==', filters.sexo));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    q = query(q, orderBy('createdAt', 'desc'));

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

const ADOPTION_REQUESTS_COLLECTION = 'adoptionRequests';

export const createAdoptionRequest = async (adoptionData) => {
  try {
    const requestWithTimestamp = {
      ...adoptionData,
      status: 'pendente',
      createdAt: serverTimestamp(),
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
    throw new Error('Falha ao solicitar adoção');
  }
};

export const getAdoptionRequests = async () => {
  try {
    const requestsRef = collection(db, ADOPTION_REQUESTS_COLLECTION);
    const q = query(requestsRef, orderBy('createdAt', 'desc'));
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
    console.error('Erro ao buscar solicitações:', error);
    throw new Error('Falha ao carregar solicitações');
  }
};

export const updateAdoptionRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, ADOPTION_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    return { id: requestId, status };
  } catch (error) {
    console.error('Erro ao atualizar solicitação:', error);
    throw new Error('Falha ao atualizar solicitação');
  }
};