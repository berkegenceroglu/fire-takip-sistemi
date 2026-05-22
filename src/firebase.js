import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmRrq1RapKaLR4_qzo2LZJblzLUVlnzXs",
  authDomain: "fire-takip-sistemi.firebaseapp.com",
  projectId: "fire-takip-sistemi",
  storageBucket: "fire-takip-sistemi.firebasestorage.app",
  messagingSenderId: "986985757257",
  appId: "1:986985757257:web:d895ff8c28092a4966dd98",
  measurementId: "G-Z3FV0BJGEM",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };