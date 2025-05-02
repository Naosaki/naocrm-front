"use client";

import React, { createContext, useContext } from 'react';
import { User } from '@/types';
import { useCustomAuth } from '../hooks/useCustomAuth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, error } = useCustomAuth();

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
