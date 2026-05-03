import { useMemo } from "react";
import { Heart, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";
import { ModalShell } from "./ui/modal-shell";

interface Profile {
  id: number | string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  interests: string[];
  location: string;
}

export interface LikedListEntry {
  profile: Profile;
  /** Суперлайк — особый интерес, иначе обычный лайк */
  isSuperLike: boolean;
  /** Одно сообщение к суперлайку (не чат). */
  superMessage?: string;
}

interface LikesModalProps {
  onClose: () => void;
  likedEntries: LikedListEntry[];
  onOpenProfile?: (profile: Profile) => void;
}

export function LikesModal({ onClose, likedEntries, onOpenProfile }: LikesModalProps) {
  const rows = useMemo(() => {
    const byId = new Map<string, LikedListEntry>();
    for (const row of likedEntries) {
      const k = String(row.profile.id);
      const prev = byId.get(k);
      if (!prev) {
        byId.set(k, row);
        continue;
      }
      byId.set(k, {
        profile: row.profile,
        isSuperLike: prev.isSuperLike || row.isSuperLike,
        superMessage: row.superMessage ?? prev.superMessage,
      });
    }
    return [...byId.values()];
  }, [likedEntries]);

  return (
    <ModalShell onClose={onClose} ariaLabel="Мои лайки">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-500 to-amber-500 text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center gap-3 pr-14">
          <Heart className="size-5 fill-white flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold">Мои лайки</h2>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll">
          {rows.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full p-8 mx-auto w-fit mb-4">
                <Heart className="size-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Пока нет лайков
              </h3>
              <p className="text-gray-600">
                Начните свайпать профили вправо, чтобы поставить лайк
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {rows.map(({ profile, isSuperLike, superMessage }) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer border-2 ${
                    isSuperLike
                      ? "bg-gradient-to-br from-sky-50 via-white to-indigo-50 border-sky-300 shadow-md shadow-sky-200/50 hover:border-sky-400"
                      : "bg-white border-gray-100 hover:border-red-200 hover:shadow-md"
                  }`}
                  onClick={() => onOpenProfile?.(profile)}
                >
                  <div className="relative shrink-0">
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className={`size-20 rounded-xl object-cover ${isSuperLike ? "ring-2 ring-sky-400 ring-offset-2" : ""}`}
                    />
                    {isSuperLike ? (
                      <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md ring-2 ring-white">
                        <Star className="size-3.5 text-white fill-white" />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-800">
                        {profile.name}, {profile.age}
                      </h3>
                      {isSuperLike ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          <Sparkles className="size-3" />
                          Суперлайк
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {profile.location}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                      {profile.bio}
                    </p>
                    {isSuperLike ? (
                      <p className="mt-1 text-xs font-medium text-sky-700">Вы показали особый интерес</p>
                    ) : null}
                    {isSuperLike && superMessage ? (
                      <p className="mt-2 rounded-xl border border-sky-100 bg-white/80 px-3 py-2 text-xs leading-snug text-gray-800">
                        {superMessage}
                      </p>
                    ) : null}
                  </div>
                  {isSuperLike ? (
                    <Star className="size-7 shrink-0 fill-sky-500 text-sky-600 drop-shadow-sm" />
                  ) : (
                    <Heart className="size-6 shrink-0 text-red-500 fill-red-500" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
