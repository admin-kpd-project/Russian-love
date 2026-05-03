import { useState } from "react";
import { X, MapPin, Cake, Mail, Heart, Sparkles, QrCode, LogOut, Camera } from "lucide-react";
import { currentUser } from "../utils/compatibilityAI";
import { Badge } from "./ui/badge";
import { ModalShell } from "./ui/modal-shell";

interface ProfileModalProps {
  onClose: () => void;
  onOpenQR?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export function ProfileModal({ onClose, onOpenQR, onOpenSettings, onLogout }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(currentUser.photo);
  const [editedData, setEditedData] = useState({
    name: currentUser.name,
    age: currentUser.age,
    location: currentUser.location,
    bio: currentUser.bio,
    interests: [...currentUser.interests],
    email: "ivanov@example.com",
  });
  const [newInterest, setNewInterest] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        currentUser.photo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here you would typically save to backend/database
    // For now, we'll just update the local state
    currentUser.name = editedData.name;
    currentUser.age = editedData.age;
    currentUser.location = editedData.location;
    currentUser.bio = editedData.bio;
    currentUser.interests = editedData.interests;
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setEditedData({
      name: currentUser.name,
      age: currentUser.age,
      location: currentUser.location,
      bio: currentUser.bio,
      interests: [...currentUser.interests],
      email: "ivanov@example.com",
    });
    setIsEditing(false);
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !editedData.interests.includes(newInterest.trim())) {
      setEditedData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setEditedData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interestToRemove)
    }));
  };

  return (
    <ModalShell onClose={onClose} ariaLabel="Профиль" hideCloseButton>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative h-24 sm:h-28 bg-gradient-to-br from-red-500 to-amber-500 flex-shrink-0">
          <button
            onClick={onOpenQR}
            className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors z-10"
          >
            <QrCode className="size-5 text-white" />
          </button>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Profile Photo */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="relative size-24 sm:size-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              <img
                src={profilePhoto}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                  >
                    <Camera className="size-8 text-white" />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content - with overflow scroll */}
        <div className="pt-14 sm:pt-16 px-5 sm:px-6 pb-5 sm:pb-6 overflow-y-auto modal-scroll flex-1 min-h-0">
          {/* Name and Age */}
          {isEditing ? (
            <div className="mb-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  value={editedData.name}
                  onChange={(e) => setEditedData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Возраст</label>
                <input
                  type="number"
                  value={editedData.age}
                  onChange={(e) => setEditedData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Город</label>
                <input
                  type="text"
                  value={editedData.location}
                  onChange={(e) => setEditedData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          ) : (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {currentUser.name}, {currentUser.age}
              </h2>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <MapPin className="size-4" />
                <span className="text-sm">{currentUser.location}</span>
              </div>
            </div>
          )}

          {!isEditing && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-3 text-center aspect-square flex flex-col items-center justify-center">
                  <Heart className="size-5 text-red-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800">24</div>
                  <div className="text-xs text-gray-600">Лайки</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-3 text-center aspect-square flex flex-col items-center justify-center">
                  <Sparkles className="size-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800">12</div>
                  <div className="text-xs text-gray-600">Матчи</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-3 text-center aspect-square flex flex-col items-center justify-center">
                  <Cake className="size-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800">{currentUser.age}</div>
                  <div className="text-xs text-gray-600">Лет</div>
                </div>
              </div>
            </>
          )}

          {/* Bio Section */}
          <div className="mb-6 mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">О себе</h3>
            </div>
            {isEditing ? (
              <textarea
                value={editedData.bio}
                onChange={(e) => setEditedData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Расскажите о себе..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{currentUser.bio}</p>
            )}
          </div>

          {/* Interests Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Интересы</h3>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mx-[0px] mt-[0px] mb-[10px]">
              {(isEditing ? editedData.interests : currentUser.interests).map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-to-r from-red-100 to-amber-100 text-red-700 border-0 text-xs sm:text-sm leading-snug"
                >
                  {interest}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >×</button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="Добавить интерес..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleAddInterest}
                  disabled={!newInterest.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Contact Info */}
          {!isEditing && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Контакты</h3>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="size-5 text-red-500" />
                <span className="text-sm">{editedData.email}</span>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={editedData.email}
                onChange={(e) => setEditedData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button 
                onClick={handleSave}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
              >
                <span>Сохранить</span>
              </button>
              <button 
                onClick={handleCancel}
                className="flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                <span>Отмена</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                >
                  <span>Редактировать</span>
                </button>
                <button 
                  onClick={onOpenSettings}
                  className="flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  <span>Настройки</span>
                </button>
              </div>
              
              {/* QR Share Button */}
              <button 
                onClick={onOpenQR}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2 mb-3"
              >
                <QrCode className="size-5 flex-shrink-0" />
                <span>Поделиться QR-кодом</span>
              </button>
              
              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="size-5 flex-shrink-0" />
                  <span>Выйти</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </ModalShell>
  );
}