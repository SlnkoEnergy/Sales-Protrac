// src/services/context/AuthContext.tsx
import  { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setRuntimeToken } from "../../utils/axios/AuthSetter";

interface AuthContextType {
  token: string | null;
  user: any;
  loading: boolean;
  setAuthData: (data: { token: string; user: any }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialToken = typeof window !== "undefined"
    ? localStorage.getItem("authToken")
    : null;

  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!initialToken);
  useEffect(() => {
    if (initialToken) {
      setRuntimeToken(initialToken);
      setLoading(false);
    }
  }, [initialToken]);

  const setAuthData = ({ token: newToken, user: newUser }: { token: string; user: any }) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    setUser(newUser);
    setRuntimeToken(newToken);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
