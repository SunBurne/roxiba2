import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_uG8mZIDwBqbf_U4OVotZtzy0quPx808",
  authDomain: "roxiba2.firebaseapp.com",
  databaseURL: "[https://roxiba2-default-rtdb.europe-west1.firebasedatabase.app](https://roxiba2-default-rtdb.europe-west1.firebasedatabase.app)",
  projectId: "roxiba2",
  storageBucket: "roxiba2.firebasestorage.app",
  messagingSenderId: "386006639574",
  appId: "1:386006639574:web:89d8f52c9926ef4af6fa77"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Firestore functions
export const fetchAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const setupDefaultStructure = async (email) => {
  try {
    const userRef = doc(db, 'users', email);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email,
        settings: {
          theme: 'light',
          notifications: true
        },
        portfolio: {
          balance: 0,
          positions: []
        },
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error setting up default structure:', error);
    throw error;
  }
};

export const getUserDocument = async (email) => {
  try {
    const userRef = doc(db, 'users', email);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

export const createUserDocument = async (email) => {
  try {
    const userRef = doc(db, 'users', email);
    await setDoc(userRef, {
      email,
      settings: {
        theme: 'light',
        notifications: true
      },
      portfolio: {
        balance: 0,
        positions: []
      },
      createdAt: new Date().toISOString()
    });
    return await getUserDocument(email);
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export { app, auth, db, storage, onAuthStateChanged };