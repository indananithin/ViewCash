import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDNfaQfPP4YnoqZ_Ysdm0nyvEjYlE6RKZ0",
  authDomain: "view-cash-803e8.firebaseapp.com",
  projectId: "view-cash-803e8",
  storageBucket: "view-cash-803e8.firebasestorage.app",
  messagingSenderId: "806458212655",
  appId: "1:806458212655:web:25b8690dc7740e26be61da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;