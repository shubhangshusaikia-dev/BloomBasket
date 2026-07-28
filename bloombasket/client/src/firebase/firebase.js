import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAL18iMcPCE2zVZ3ynFrEUrnleheLBoobg",
  authDomain: "project-name--bloombasket.firebaseapp.com",
  projectId: "project-name--bloombasket",
  storageBucket: "project-name--bloombasket.firebasestorage.app",
  messagingSenderId: "288807455249",
  appId: "1:288807455249:web:d92ed51d2b4ce8577d7fb0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;