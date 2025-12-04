import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKmKfL4BvR4QdOXje_Xtkom-yk7qEGU2o",
  authDomain: "personalmanager-d85c0.firebaseapp.com",
  projectId: "personalmanager-d85c0",
  storageBucket: "personalmanager-d85c0.firebasestorage.app",
  messagingSenderId: "41372778032",
  appId: "1:41372778032:web:049b8448bbc18a8a77f7f5",
  measurementId: "G-KZD7XV1HSZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
