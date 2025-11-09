import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBremkv2tinRy1h-zq7g-NdTDeojD9PoeM",
  authDomain: "proyectofinal-f4e90.firebaseapp.com",
  projectId: "proyectofinal-f4e90",
  storageBucket: "proyectofinal-f4e90.firebasestorage.app",
  messagingSenderId: "979162308151",
  appId: "1:979162308151:web:e8eddf9a56d05e926569b2",
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);

export default app;
