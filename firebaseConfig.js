// firebaseConfig.js
import { initializeApp } from 'firebase/app';

import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";


const firebaseConfig = {
  apiKey: "AIzaSyBRP85i_pUSVy9e_9Vhz_OmHoW_BiA0wB4",
  authDomain: "smartbus-a7cc2.firebaseapp.com",
  projectId: "smartbus-a7cc2",
  storageBucket: "smartbus-a7cc2.appspot.com",
  messagingSenderId: "1055653818037",
  appId: "1:1055653818037:android:7baa22e9d7747ec96a98fc"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de l'authentification avec persistance
const auth = initializeAuth(app);

// Initialisation de Firestore
const db = getFirestore(app);

const firestore = getFirestore(app); 
// Exportation des instances Firebase
export { app, auth, db,firestore };