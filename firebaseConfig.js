import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase extraite du projet

const firebaseConfig = {
  apiKey: "AIzaSyDWYnW1lCO0ARGgYCVTXQgP7j4lIu-J9-c",
  authDomain: "smartbus-81f88.firebaseapp.com", // probable, même si non affiché
  projectId: "smartbus-81f88",
  storageBucket: "smartbus-81f88.appspot.com", // probable
  messagingSenderId: "34653720405",
  appId: "1:34653720405:android:2e5aded2118920d30ca9dc",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
