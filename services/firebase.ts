import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbNplwxn5D5a2N9bh2uTjEmtWT8LoXMQI",
  authDomain: "aspencore-1106c.firebaseapp.com",
  projectId: "aspencore-1106c",
  storageBucket: "aspencore-1106c.firebasestorage.app",
  messagingSenderId: "1012458888802",
  appId: "1:1012458888802:web:e4219be6c9e4ec47fdfb3b",
  measurementId: "G-HF6SHEW8BX",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;