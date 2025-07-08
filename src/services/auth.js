import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const USERS_COLLECTION = 'users';

export const registerUser = async (userData) => {
  try {
    const { email, password, nome, tipoUsuario, telefone } = userData;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: nome
    });

    const userDocData = {
      uid: user.uid,
      nome,
      email,
      tipoUsuario,
      telefone: telefone || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), userDocData);

    return {
      user,
      userData: userDocData
    };
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Dados do usuário não encontrados');
    }

    const userData = userDoc.data();

    return {
      user,
      userData
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw new Error('Erro ao sair da conta');
  }
};

export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw new Error('Erro ao carregar dados do usuário');
  }
};

export const checkEmailExists = async (email) => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return false;
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este email já está sendo usado por outra conta';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/invalid-credential':
      return 'Credenciais inválidas';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Tente novamente mais tarde';
    default:
      return 'Erro na autenticação. Tente novamente';
  }
};