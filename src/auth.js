// src/services/auth.js
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset
} from "firebase/auth";

const auth = getAuth();

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const confirmReset = async (code, newPassword) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error) {
    throw error;
  }
};

export default {
  signIn,
  signUp,
  logout,
  resetPassword,
  confirmReset
};