import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            // Create a new user profile in Firestore
            const newUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              phone: firebaseUser.phoneNumber || '',
              coins: 100, // Starting coins
              tickets: 0,
              isAdmin: false,
              deviceId: generateDeviceId(),
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newUser);
            setUser({ ...firebaseUser, ...newUser });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser); // Fallback to basic auth user
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = (containerId) => {
    // We now initialize this in Login.jsx useEffect to prevent React DOM issues
  };

  const loginWithPhone = async (phoneNumber, containerId) => {
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error("Recaptcha not initialized. Please refresh the page.");
      }
      // Add +91 if not present for India, assume it's included or passed correctly
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true };
    } catch (error) {
      console.error("Phone Auth Error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("OTP Error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google Auth Error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceId = () => {
    let id = localStorage.getItem('viewCashDeviceId');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('viewCashDeviceId', id);
    }
    return id;
  };

  const value = {
    user,
    setUser, // Expose setUser for local updates
    loginWithPhone,
    verifyOtp,
    loginWithGoogle,
    logout,
    loading,
    setLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
