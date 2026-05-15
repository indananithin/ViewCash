import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithPhoneNumber, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
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
            let pendingData = {};
            try { 
              const saved = sessionStorage.getItem('viewCashPendingSignUp');
              if (saved) pendingData = JSON.parse(saved);
            } catch(e){}

            const newUser = {
              uid: firebaseUser.uid,
              name: pendingData.name || 'User',
              phone: pendingData.phone || '',
              coins: 0, // Starting coins
              tickets: 0,
              isAdmin: false,
              deviceId: generateDeviceId(),
              createdAt: new Date().toISOString(),
              lastCheckedNotifications: new Date().toISOString(),
              appliedReferral: pendingData.referralCode || ''
            };
            
            await setDoc(userDocRef, newUser);
            sessionStorage.removeItem('viewCashPendingSignUp');
            
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

  const loginWithEmail = async (email, password, isSignUp = false, extraData = {}) => {
    try {
      setLoading(true);
      if (isSignUp) {
        // Temporarily store the name and referral code so onAuthStateChanged can pick it up
        sessionStorage.setItem('viewCashPendingSignUp', JSON.stringify({
          phone: email.split('@')[0],
          name: extraData.name,
          referralCode: extraData.referralCode
        }));
        
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
          // If account already exists in Auth but data is missing in Firestore (e.g. deleted by admin)
          // We can try to just sign in. If it succeeds, onAuthStateChanged will recreate the Firestore doc.
          if (err.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw err;
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error("Email Auth Error:", error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      setLoading(false);
      console.error("Google Auth Error:", error);
      return { success: false, error: error.message };
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
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
    loginWithEmail,
    loginWithGoogle,
    logout,
    loading,
    setLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
