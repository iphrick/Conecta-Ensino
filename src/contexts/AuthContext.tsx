"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword as fbSignIn, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword as fbCreateUser
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

// Interface do perfil de usuário no banco de dados com status de ativação
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: "admin" | "teacher" | "student";
  createdAt: string;
  status: "pending" | "approved"; // Status de aprovação pelo Admin
}

interface AuthContextType {
  user: any | null; // Firebase User ou Mock User
  profile: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: "student" | "teacher" | "admin") => Promise<void>;
  logout: () => Promise<void>;
  updateProfileState: (updatedProfile: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>; // Para atualizar status na holding page
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chaves padrão para Mock LocalStorage
const MOCK_PROFILE_KEY = "conecta_mock_profile";
const MOCK_USER_KEY = "conecta_mock_user";

// Dados de usuários Mock
const MOCK_USERS: Record<string, UserProfile & { password?: string }> = {
  "admin@conecta.com": {
    id: "mock-admin-uid",
    name: "Dr. Pedro (Admin)",
    email: "admin@conecta.com",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    role: "admin",
    createdAt: new Date().toISOString(),
    status: "approved",
    password: "123456"
  },
  "professor@conecta.com": {
    id: "mock-teacher-uid",
    name: "Professor Marcelo (Instrutor)",
    email: "professor@conecta.com",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    role: "teacher",
    createdAt: new Date().toISOString(),
    status: "approved",
    password: "123456"
  },
  "aluno@conecta.com": {
    id: "mock-student-uid",
    name: "Guilherme Silva (Aluno)",
    email: "aluno@conecta.com",
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    role: "student",
    createdAt: new Date().toISOString(),
    status: "approved",
    password: "123456"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    // Detecta se devemos rodar em Mock Mode (chaves vazias ou mockadas do Firebase)
    const isMockMode = 
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-api-key";
    
    setIsMock(isMockMode);

    if (isMockMode) {
      // --- MOCK FLOW ---
      const storedUser = localStorage.getItem(MOCK_USER_KEY);
      const storedProfile = localStorage.getItem(MOCK_PROFILE_KEY);

      if (storedUser && storedProfile) {
        setUser(JSON.parse(storedUser));
        setProfile(JSON.parse(storedProfile));
      }
      setLoading(false);
    } else {
      // --- REAL FIREBASE FLOW ---
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            // Busca o documento correspondente na coleção /users
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const data = userDocSnap.data() as UserProfile;
              setProfile(data);
              document.cookie = `conecta-role=${data.role}; path=/; max-age=86400; SameSite=Lax`;
              document.cookie = `conecta-status=${data.status || "approved"}; path=/; max-age=86400; SameSite=Lax`;
            } else {
              // Se o documento não existir (por exemplo, login social na primeira vez)
              const defaultProfile: UserProfile = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "Usuário",
                email: firebaseUser.email || "",
                photoURL: firebaseUser.photoURL || null,
                role: "student",
                status: "pending", // Por padrão é pendente de aprovação
                createdAt: new Date().toISOString()
              };
              await setDoc(userDocRef, defaultProfile);
              setProfile(defaultProfile);
              document.cookie = `conecta-role=student; path=/; max-age=86400; SameSite=Lax`;
              document.cookie = `conecta-status=pending; path=/; max-age=86400; SameSite=Lax`;
            }
            document.cookie = `conecta-session=active; path=/; max-age=86400; SameSite=Lax`;
          } catch (error) {
            console.error("Erro ao carregar perfil do Firestore:", error);
          }
        } else {
          setUser(null);
          setProfile(null);
          // Limpa os cookies
          document.cookie = "conecta-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "conecta-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "conecta-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  const refreshProfile = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      if (isMock) {
        // Busca da lista no localstorage
        const usersList = localStorage.getItem("c_users_list");
        if (usersList) {
          const list = JSON.parse(usersList) as UserProfile[];
          const current = list.find(u => u.id === profile.id);
          if (current) {
            setProfile(current);
            localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(current));
            document.cookie = `conecta-status=${current.status}; path=/; max-age=86400; SameSite=Lax`;
          }
        }
      } else {
        const userDocSnap = await getDoc(doc(db, "users", user.uid));
        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserProfile;
          setProfile(data);
          document.cookie = `conecta-status=${data.status || "approved"}; path=/; max-age=86400; SameSite=Lax`;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isMock) {
        // Fluxo Mock - tenta ler da lista dinâmica no localstorage primeiro
        const usersList = localStorage.getItem("c_users_list");
        let matchedProfile: any = null;
        
        if (usersList) {
          const list = JSON.parse(usersList) as any[];
          matchedProfile = list.find(u => u.email.toLowerCase() === email.toLowerCase() && (u.password === password || password === "123456"));
        }
        
        // Fallback pro seed estático
        if (!matchedProfile) {
          matchedProfile = MOCK_USERS[email.toLowerCase()];
          if (matchedProfile && matchedProfile.password !== password) {
            matchedProfile = null;
          }
        }

        if (matchedProfile) {
          const mockUserObj = { uid: matchedProfile.id, email: matchedProfile.email, displayName: matchedProfile.name };
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUserObj));
          localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(matchedProfile));
          setUser(mockUserObj);
          setProfile(matchedProfile);
          
          document.cookie = `conecta-session=active; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `conecta-role=${matchedProfile.role}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `conecta-status=${matchedProfile.status || "approved"}; path=/; max-age=86400; SameSite=Lax`;
        } else {
          throw new Error("Credenciais inválidas no modo de demonstração.");
        }
      } else {
        // Fluxo Real
        await fbSignIn(auth, email, password);
      }
    } catch (error: any) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: "student" | "teacher" | "admin" = "student") => {
    setLoading(true);
    try {
      if (isMock) {
        // Adiciona um aluno/professor dinamicamente no mock com status 'pending' por padrão
        const newUid = `mock-${role}-${Date.now()}`;
        const initialStatus = role === "admin" ? "approved" : "pending";
        const newProfile: UserProfile = {
          id: newUid,
          name,
          email,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          role,
          status: initialStatus,
          createdAt: new Date().toISOString()
        };
        
        // Grava na lista dinâmica de usuários do LocalStorage
        const usersList = localStorage.getItem("c_users_list");
        let list: any[] = [];
        if (usersList) {
          list = JSON.parse(usersList);
        } else {
          // Seeds iniciais de users do list
          list = Object.values(MOCK_USERS);
        }
        list.push({ ...newProfile, password });
        localStorage.setItem("c_users_list", JSON.stringify(list));
        
        const mockUserObj = { uid: newUid, email, displayName: name };
        localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUserObj));
        localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(newProfile));
        setUser(mockUserObj);
        setProfile(newProfile);

        document.cookie = `conecta-session=active; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `conecta-role=${role}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `conecta-status=${initialStatus}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        // Fluxo Real
        const userCredential = await fbCreateUser(auth, email, password);
        const fbUser = userCredential.user;
        const initialStatus = role === "admin" ? "approved" : "pending";
        const newProfile: UserProfile = {
          id: fbUser.uid,
          name,
          email,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          role,
          status: initialStatus,
          createdAt: new Date().toISOString()
        };
        // Grava no Firestore
        await setDoc(doc(db, "users", fbUser.uid), newProfile);
        setUser(fbUser);
        setProfile(newProfile);

        document.cookie = `conecta-session=active; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `conecta-role=${role}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `conecta-status=${initialStatus}; path=/; max-age=86400; SameSite=Lax`;
      }
    } catch (error: any) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isMock) {
        localStorage.removeItem(MOCK_USER_KEY);
        localStorage.removeItem(MOCK_PROFILE_KEY);
        setUser(null);
        setProfile(null);
        document.cookie = "conecta-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "conecta-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "conecta-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } else {
        await fbSignOut(auth);
      }
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileState = (updatedProfile: Partial<UserProfile>) => {
    if (profile) {
      const newProf = { ...profile, ...updatedProfile };
      setProfile(newProf);
      if (isMock) {
        localStorage.setItem(MOCK_PROFILE_KEY, JSON.stringify(newProf));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isMock, login, register, logout, updateProfileState, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
