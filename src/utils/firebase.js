import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuy6-Hg7ddguzFJDS46TOxeUkOx8eDvuY",
  authDomain: "shop-check-in-system.firebaseapp.com",
  projectId: "shop-check-in-system",
  storageBucket: "shop-check-in-system.firebasestorage.app",
  messagingSenderId: "468241417151",
  appId: "1:468241417151:web:acda03867821b81388570a",
  measurementId: "G-TEHBFBXPB1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

