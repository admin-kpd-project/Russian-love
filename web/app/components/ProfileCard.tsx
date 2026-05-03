import { Heart, X, MapPin, Briefcase, GraduationCap, Sparkles, AlertTriangle, Star } from "lucide-react";
import { normalizeAssetUrlForHttps } from "../utils/mediaUrl";
import { Badge } from "./ui/badge";

interface ProfileCardProps {
  profile: UserProfile;
  compatibility: number;
  superLikesRemaining: number;
  likesCount: number;
  onOpenDetailedAnalysis?: () => void;
}

export function ProfileCard({ profile, compatibility, superLikesRemaining, likesCount, onOpenDetailedAnalysis }: ProfileCardProps) {
  const getCompatibilityColor = (percentage: number) => {
    if (percentage >= 85) return "from-red-500 to-amber-500";
    if (percentage >= 75) return "from-red-400 to-orange-500";
    if (percentage >= 65) return "from-orange-500 to-yellow-500";
    return "from-amber-500 to-yellow-500";
  };

  const getCompatibilityLabel = (percentage: number) => {
    if (percentage >= 90) return "Идеальное совпадение";
    if (percentage >= 80) return "Отличная совместимость";
    if (percentage >= 70) return "Высокая совместимость";
    return "Хорошая совместимость";
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative select-none flex flex-col">
      {/* Profile Image */}
      <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-100">
        <img
          src={normalizeAssetUrlForHttps(profile.photo)}
          alt={profile.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ objectFit: 'cover' }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Stats - Super Likes and Likes */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex flex-col gap-2">
          {/* Super Likes Counter */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Star className="size-3 sm:size-4 text-white fill-white" />
              <span className="text-white text-xs sm:text-sm font-bold">{superLikesRemaining}</span>
            </div>
          </div>
          
          {/* Likes Counter */}
          <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Heart className="size-3 sm:size-4 text-white fill-white" />
              <span className="text-white text-xs sm:text-sm font-bold">{likesCount}</span>
            </div>
          </div>
        </div>
        
        {/* Compatibility Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div className={`bg-gradient-to-br ${getCompatibilityColor(compatibility)} rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg backdrop-blur-sm`}>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {compatibility >= 50 ? (
                <Sparkles className="size-4 sm:size-5 text-white" />
              ) : (
                <AlertTriangle className="size-4 sm:size-5 text-white" />
              )}
              <div className="text-white">
                <div className="text-xl sm:text-2xl font-bold leading-tight">{compatibility}%</div>
                <div className="text-[10px] sm:text-xs opacity-90 leading-tight">
                  {compatibility >= 50 ? "совместимость" : "низкая совместимость"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Name and Age */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1">
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center gap-1 text-white/90">
            <MapPin className="size-3 sm:size-4" />
            <span className="text-xs sm:text-sm">{profile.location}</span>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex-shrink-0 p-4 sm:p-6 overflow-y-auto max-h-[40%]">
        {/* Bio */}
        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed line-clamp-3">{profile.bio}</p>

        {/* Compatibility Label */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          {/* Compatibility Button */}
          <div className="flex-1 flex items-center gap-2 p-2.5 sm:p-3 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl">
            <Heart className="size-4 sm:size-5 text-red-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {getCompatibilityLabel(compatibility)}
            </span>
          </div>
          
          {/* Detailed Analysis Button */}
          {onOpenDetailedAnalysis && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetailedAnalysis();
              }}
              className="flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Sparkles className="size-4 sm:size-5" />
              <span className="text-xs sm:text-sm font-semibold">Детально</span>
            </button>
          )}
        </div>

        {/* Interests */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <Briefcase className="size-3 sm:size-4" />
            Интересы
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {profile.interests.map((interest, index) => (
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
      </div>
    </div>
  );
}