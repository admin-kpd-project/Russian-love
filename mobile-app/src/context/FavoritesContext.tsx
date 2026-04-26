import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { User } from "../types/user";
import type { UserProfile } from "../utils/compatibilityAI";

type Ctx = {
  favorites: User[];
  addToFavorites: (user: User) => void;
  removeFromFavorites: (userId: string) => void;
  isFavorite: (userId: string | number) => boolean;
  toggleFavorite: (user: User | UserProfile) => void;
};

const FavoritesContext = createContext<Ctx | undefined>(undefined);

function toUser(user: User | UserProfile): User {
  if ("photos" in user && Array.isArray((user as User).photos)) {
    return user as User;
  }
  const p = user as UserProfile;
  return {
    id: String(p.id),
    name: p.name,
    age: p.age,
    location: p.location,
    bio: p.bio,
    photos: p.photo ? [p.photo] : [],
    interests: p.interests,
    online: false,
  };
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<User[]>([]);

  const addToFavorites = useCallback((user: User) => {
    setFavorites((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
  }, []);

  const removeFromFavorites = useCallback((userId: string) => {
    setFavorites((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const isFavorite = useCallback(
    (userId: string | number) => favorites.some((u) => u.id === String(userId)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (user: User | UserProfile) => {
      const u = toUser(user);
      if (isFavorite(u.id)) removeFromFavorites(u.id);
      else addToFavorites(u);
    },
    [addToFavorites, isFavorite, removeFromFavorites]
  );

  const value = useMemo(
    () => ({ favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite }),
    [favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const v = useContext(FavoritesContext);
  if (!v) throw new Error("useFavorites outside FavoritesProvider");
  return v;
}
