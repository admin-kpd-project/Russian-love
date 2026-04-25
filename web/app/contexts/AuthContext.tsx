import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProfileResponse } from "../services/authService";
import { getCurrentUser } from "../services/usersService";
import { tokenStorage } from "../services/api";

interface AuthContextType {
  user: ProfileResponse | null;
  loading: boolean;
  setUser: (user: ProfileResponse | null) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const accessToken = tokenStorage.getAccessToken();
      
      if (!accessToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await getCurrentUser();
      
      if (response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        tokenStorage.clearTokens();
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
      tokenStorage.clearTokens();
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const isAuthenticated = !!user && !!tokenStorage.getAccessToken();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        refreshUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}