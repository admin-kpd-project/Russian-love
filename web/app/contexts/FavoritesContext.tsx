import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { UserProfile } from '../utils/compatibilityAI';

interface FavoritesContextType {
  favorites: User[];
  addToFavorites: (user: User) => void;
  removeFromFavorites: (userId: string) => void;
  isFavorite: (userId: string | number) => boolean;
  toggleFavorite: (user: User | UserProfile) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<User[]>([]);

  // Convert UserProfile to User format
  const convertToUser = (user: User | UserProfile): User => {
    // Check if it's already a User type (has photos array)
    if ('photos' in user) {
      return user;
    }
    
    // Convert UserProfile to User
    const profile = user as UserProfile;
    const convertedUser = {
      id: String(profile.id),
      name: profile.name,
      age: profile.age,
      location: profile.location,
      job: '', // UserProfile doesn't have job field
      education: '', // UserProfile doesn't have education field
      bio: profile.bio,
      photos: profile.photo ? [profile.photo] : [],
      interests: profile.interests,
      online: false,
    };
    
    // Debug log to verify photo conversion
    console.log('Converting UserProfile to User:', {
      profilePhoto: profile.photo,
      userPhotos: convertedUser.photos,
      name: profile.name
    });
    
    return convertedUser;
  };

  const addToFavorites = (user: User) => {
    setFavorites(prev => {
      if (prev.some(u => u.id === user.id)) return prev;
      return [...prev, user];
    });
  };

  const removeFromFavorites = (userId: string) => {
    setFavorites(prev => prev.filter(u => u.id !== userId));
  };

  const isFavorite = (userId: string | number) => {
    const idString = String(userId);
    return favorites.some(u => u.id === idString);
  };

  const toggleFavorite = (user: User | UserProfile) => {
    const userId = String(user.id);
    if (isFavorite(userId)) {
      removeFromFavorites(userId);
    } else {
      const convertedUser = convertToUser(user);
      addToFavorites(convertedUser);
    }
  };

  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites, 
        addToFavorites, 
        removeFromFavorites, 
        isFavorite,
        toggleFavorite 
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}