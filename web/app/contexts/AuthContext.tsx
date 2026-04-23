import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProfileResponse } from "../services/authService";
import { getCurrentUser } from "../services/usersService";
import { tokenStorage, DEMO_MODE } from "../services/api";

interface AuthContextType {
  user: ProfileResponse | null;
  loading: boolean;
  setUser: (user: ProfileResponse | null) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  demoMode: boolean;
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

      // In demo mode, skip API call
      if (DEMO_MODE) {
        console.log("Running in DEMO mode - skipping API calls");
        setUser({
          id: "demo-user",
          name: "Демо Пользователь",
          email: "demo@example.com",
          birthDate: "1990-01-01",
          age: 34,
          photos: [],
          interests: [],
          preferences: {
            minAge: 18,
            maxAge: 99,
            maxDistance: 100,
          },
        });
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
        demoMode: DEMO_MODE,
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