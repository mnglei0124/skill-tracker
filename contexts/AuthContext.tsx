"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error("Error during Google sign-in: ", error);
      // Optionally, use toast notifications for errors here
      // import { toast } from "react-hot-toast";
      // toast.error("Sign-in failed. Please try again.");
      throw error; // Re-throw to allow the caller to handle it if needed
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be updated to null by the onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, use toast notifications for errors here
      // import { toast } from "react-hot-toast";
      // toast.error("Sign-out failed.");
      throw error;
    }
  };

  const value = {
    currentUser,
    isLoading,
    signInWithGoogle,
    signOut,
  };

  // Render children only when not loading to prevent flash of unauthenticated content
  // or to prevent children from trying to access user data before it's available.
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
