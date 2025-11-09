import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "../firebase";

const AuthContext = createContext();

const DEFAULT_ROLE = "reportero";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      const profileRef = doc(firebaseDb, "profiles", authUser.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        const fallbackProfile = {
          email: authUser.email || "",
          role: DEFAULT_ROLE,
          username: authUser.email?.split("@")[0] || "usuario",
          usernameLowercase: authUser.email?.split("@")[0]?.toLowerCase() || "usuario",
        };
        await setDoc(profileRef, fallbackProfile, { merge: true });
        setUser({ id: authUser.uid, ...fallbackProfile });
        return;
      }

      const profileData = profileSnap.data();
      setUser({
        id: authUser.uid,
        email: profileData.email || authUser.email || "",
        role: profileData.role || DEFAULT_ROLE,
        username: profileData.username || profileData.email?.split("@")[0] || "usuario",
      });
    } catch (error) {
      console.error("Error cargando perfil:", error);
      setUser({
        id: authUser.uid,
        email: authUser.email || "",
        role: DEFAULT_ROLE,
        username: authUser.email?.split("@")[0] || "usuario",
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (authUser) => {
      await loadProfile(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile]);

  const login = async (email, password) => {
    const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password);
    await loadProfile(credentials.user);
  };

  const register = async (email, password, role = DEFAULT_ROLE, username) => {
    const cleanUsername = username?.trim();
    if (!cleanUsername) {
      throw new Error("Debes ingresar un nombre de usuario.");
    }

    const profilesRef = collection(firebaseDb, "profiles");
    const usernameQuery = query(profilesRef, where("usernameLowercase", "==", cleanUsername.toLowerCase()));
    const existing = await getDocs(usernameQuery);

    if (!existing.empty) {
      throw new Error("El nombre de usuario ya está en uso. Elige otro.");
    }

    const credentials = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const authUser = credentials.user;

    const profileRef = doc(firebaseDb, "profiles", authUser.uid);
    await setDoc(profileRef, {
      email,
      role,
      username: cleanUsername,
      usernameLowercase: cleanUsername.toLowerCase(),
      createdAt: new Date().toISOString(),
    });

    await loadProfile(authUser);
    return credentials;
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
  };

  const value = { user, loading, login, logout, register };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
