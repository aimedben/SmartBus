import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBODZZXfk5lQRpGphZg2Bvt6D4DfJrcrOg",
  authDomain: "smartbus-5d940.firebaseapp.com",
  projectId: "smartbus-5d940",
  storageBucket: "smartbus-5d940.firebasestorage.app",
  messagingSenderId: "1034025920291",
  appId: "1:1034025920291:web:3e729c2a37534cfd2f0e96",
  measurementId: "G-KC5QZEZ62S"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
