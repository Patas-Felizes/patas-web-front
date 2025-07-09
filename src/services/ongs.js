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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ONGS_COLLECTION = 'ongs';

export const createOng = async (ongData, userId) => {
  try {
    const ongWithTimestamp = {
      ...ongData,
      protetores: [userId],
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, ONGS_COLLECTION),
      ongWithTimestamp,
    );

    return {
      id: docRef.id,
      ...ongWithTimestamp,
    };
  } catch (error) {
    console.error('Erro ao criar ONG:', error);
    throw new Error('Falha ao cadastrar ONG');
  }
};

export const getOngsByUser = async (userId) => {
  try {
    const ongsRef = collection(db, ONGS_COLLECTION);
    const q = query(
      ongsRef,
      where('protetores', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const ongs = [];
    querySnapshot.forEach((doc) => {
      ongs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return ongs;
  } catch (error) {
    console.error('Erro ao buscar ONGs:', error);
    throw new Error('Falha ao carregar ONGs');
  }
};

export const getOngById = async (ongId) => {
  try {
    const ongRef = doc(db, ONGS_COLLECTION, ongId);
    const ongSnap = await getDoc(ongRef);

    if (ongSnap.exists()) {
      return {
        id: ongSnap.id,
        ...ongSnap.data(),
      };
    } else {
      throw new Error('ONG não encontrada');
    }
  } catch (error) {
    console.error('Erro ao buscar ONG:', error);
    throw error;
  }
};

export const updateOng = async (ongId, ongData) => {
  try {
    const ongRef = doc(db, ONGS_COLLECTION, ongId);
    const updatedData = {
      ...ongData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(ongRef, updatedData);

    return {
      id: ongId,
      ...updatedData,
    };
  } catch (error) {
    console.error('Erro ao atualizar ONG:', error);
    throw new Error('Falha ao atualizar ONG');
  }
};

export const deleteOng = async (ongId) => {
  try {
    const ongRef = doc(db, ONGS_COLLECTION, ongId);
    await deleteDoc(ongRef);

    return ongId;
  } catch (error) {
    console.error('Erro ao deletar ONG:', error);
    throw new Error('Falha ao remover ONG');
  }
};

export const addProtetorToOng = async (ongId, userId) => {
  try {
    const ongRef = doc(db, ONGS_COLLECTION, ongId);
    await updateDoc(ongRef, {
      protetores: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    return { ongId, userId };
  } catch (error) {
    console.error('Erro ao adicionar protetor:', error);
    throw new Error('Falha ao adicionar protetor');
  }
};

export const removeProtetorFromOng = async (ongId, userId) => {
  try {
    const ongRef = doc(db, ONGS_COLLECTION, ongId);
    await updateDoc(ongRef, {
      protetores: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });

    return { ongId, userId };
  } catch (error) {
    console.error('Erro ao remover protetor:', error);
    throw new Error('Falha ao remover protetor');
  }
};