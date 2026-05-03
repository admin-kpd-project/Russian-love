import { MapPin, Cake, Heart, Sparkles } from "lucide-react";
import { UserProfile } from "../utils/compatibilityAI";
import { Badge } from "./ui/badge";
import { ModalShell } from "./ui/modal-shell";
import { normalizeAssetUrlForHttps } from "../utils/mediaUrl";

interface UserProfileModalProps {
  profile?: UserProfile;
  user?: any; // For compatibility with User type
  onClose: () => void;
}

export function UserProfileModal({ profile, user, onClose }: UserProfileModalProps) {
  // Support both profile and user props
  const data = profile || user;
  
  if (!data) return null;
  
  // Handle different field names
  const photoUrl = data.photo || data.photos?.[0] || 'https://via.placeholder.com/128';
  const userName = data.name;
  const userAge = data.age;
  const userLocation = data.location;
  const userBio = data.bio;
  const userInterests = data.interests || [];
  const hasAstrology = data.astrology;
  const hasNumerology = data.numerology;

  return (
    <ModalShell onClose={onClose} ariaLabel={`Профиль ${userName}`}>
      <div className="flex flex-col h-full">
        {/* Header with Photo */}
        <div className="relative h-24 sm:h-28 bg-gradient-to-br from-red-600 to-amber-500 flex-shrink-0">
          {/* Profile Photo */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
            <div className="size-24 sm:size-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              <img
                src={normalizeAssetUrlForHttps(photoUrl)}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content - with overflow scroll */}
        <div className="pt-14 sm:pt-16 px-5 sm:px-6 pb-5 sm:pb-6 overflow-y-auto modal-scroll flex-1 min-h-0">
          {/* Name and Age */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {userName}, {userAge}
            </h2>
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <MapPin className="size-4" />
              <span className="text-sm">{userLocation}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-3 text-center aspect-square flex flex-col items-center justify-center">
              <Heart className="size-5 text-red-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">-</div>
              <div className="text-xs text-gray-600">Лайки</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-3 text-center aspect-square flex flex-col items-center justify-center">
              <Sparkles className="size-5 text-amber-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">-</div>
              <div className="text-xs text-gray-600">Матчи</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-3 text-center aspect-square flex flex-col items-center justify-center">
              <Cake className="size-5 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800">{userAge}</div>
              <div className="text-xs text-gray-600">Лет</div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">О себе</h3>
            <p className="text-gray-700 leading-relaxed">{userBio}</p>
          </div>

          {/* Interests Section */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Интересы</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {userInterests.map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-to-r from-red-100 to-amber-100 text-red-700 border-0 text-xs sm:text-sm leading-snug"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Astrology Section */}
          {hasAstrology && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Астрология</h3>
              <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Знак зодиака</div>
                    <div className="font-medium text-gray-800">{data.astrology.zodiacSign}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Элемент</div>
                    <div className="font-medium text-gray-800 capitalize">{data.astrology.element}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Луна</div>
                    <div className="font-medium text-gray-800">{data.astrology.moonSign}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Асцендент</div>
                    <div className="font-medium text-gray-800">{data.astrology.ascendant}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Numerology Section */}
          {hasNumerology && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Нумерология</h3>
              <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 mb-1">{data.numerology.lifePath}</div>
                    <div className="text-xs text-gray-600">Путь жизни</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500 mb-1">{data.numerology.soulUrge}</div>
                    <div className="text-xs text-gray-600">Душа</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-1">{data.numerology.destiny}</div>
                    <div className="text-xs text-gray-600">Судьба</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}