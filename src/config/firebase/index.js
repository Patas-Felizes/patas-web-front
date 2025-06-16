import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebase from "firebase/compat/app";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
//const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db }