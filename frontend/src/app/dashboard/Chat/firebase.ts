// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiw7Q07ZrIttZfndAVhO_WPGEz1_CJQ8E",
  authDomain: "dashboard-chat-22ff1.firebaseapp.com",
  projectId: "dashboard-chat-22ff1",
  storageBucket: "dashboard-chat-22ff1.firebasestorage.app",
  messagingSenderId: "1005063335293",
  appId: "1:1005063335293:web:2050912bebd2facbf27014",
  measurementId: "G-BEZ2V63LWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };