import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBLYtvCRPn1zOhdnU1DhMkDZT4FN9MPXlg",
  authDomain: "patas-felizes-59366.firebaseapp.com",
  projectId: "patas-felizes-59366",
  storageBucket: "patas-felizes-59366.firebasestorage.app",
  messagingSenderId: "104419646979",
  appId: "1:104419646979:web:d76beab99939c806bc3836",
  measurementId: "G-LRS3K9SL62"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, db, storage };