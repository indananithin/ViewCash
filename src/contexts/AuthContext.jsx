import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

// ── Cached auth helpers ──────────────────────────────────────────────────────
// We persist a minimal user snapshot to localStorage so that on cold start
// the app IMMEDIATELY knows the auth state (loading = false) instead of
// waiting 4-5 seconds for Firebase to resolve the network token check.
const CACHE_KEY = 'vc_user_cache';

function readCachedUser() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCachedUser(user) {
  try {
    if (user) {
      // Only store the fields we actually need so it stays small
      const slim = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        name: user.name,
        coins: user.coins,
        tickets: user.tickets,
        isAdmin: user.isAdmin,
        phone: user.phone,
        deviceId: user.deviceId,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(slim));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch { /* storage full — ignore */ }
}
// ────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  // Start with cached user so we skip the white loading screen entirely.
  // The real Firebase auth check runs in parallel in the background.
  const cachedUser = readCachedUser();
  const [user, setUser] = useState(cachedUser);
  // If we have a cached user, loading is false right away — no splash needed!
  const [loading, setLoading] = useState(cachedUser === null);
  // Track whether Firebase has confirmed the session yet
  const firebaseConfirmed = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      firebaseConfirmed.current = true;

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const fullUser = { ...firebaseUser, ...userDoc.data() };
            setUser(fullUser);
            writeCachedUser(fullUser);
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
              coins: 0,
              tickets: 0,
              isAdmin: false,
              deviceId: generateDeviceId(),
              createdAt: new Date().toISOString(),
              lastCheckedNotifications: new Date().toISOString(),
              appliedReferral: pendingData.referralCode || ''
            };
            
            await setDoc(userDocRef, newUser);
            sessionStorage.removeItem('viewCashPendingSignUp');
            
            const fullUser = { ...firebaseUser, ...newUser };
            setUser(fullUser);
            writeCachedUser(fullUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser);
          writeCachedUser(firebaseUser);
        }
      } else {
        // Firebase confirmed no logged-in user — clear cache and state
        setUser(null);
        writeCachedUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password, isSignUp = false, extraData = {}) => {
    try {
      setLoading(true);
      if (isSignUp) {
        sessionStorage.setItem('viewCashPendingSignUp', JSON.stringify({
          phone: email.split('@')[0],
          name: extraData.name,
          referralCode: extraData.referralCode
        }));
        
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
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
      writeCachedUser(null);
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
    setUser,
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
