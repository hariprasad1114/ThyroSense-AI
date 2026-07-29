'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from './insforge';

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.metadata?.name as string | undefined,
          });
        }
      } catch {
        // not authenticated
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await insforge.auth.signUp({ email, password, name });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data?.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.metadata?.name as string | undefined,
      });
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await insforge.auth.signOut();
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
