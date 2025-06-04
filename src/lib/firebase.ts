
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace these with your actual Firebase config
  apiKey: "AIzaSyBGkxHvMjYyJQl7Wx8bF3_9mVvQZqH7k8Y",
  authDomain: "vlitrix-demo.firebaseapp.com",
  projectId: "vlitrix-demo",
  storageBucket: "vlitrix-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
