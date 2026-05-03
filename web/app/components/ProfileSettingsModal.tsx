import { useEffect, useMemo, useState } from "react";
import { X, MapPin, Mail, Heart, Sparkles, Cake, QrCode, LogOut, Camera } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../services/usersService";
import { uploadFile } from "../services/uploadService";
import { profileStatsPlaceholder } from "../constants/profileDisplay";
import { Badge } from "./ui/badge";
import { ModalShell } from "./ui/modal-shell";

interface ProfileSettingsModalProps {
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenQR: () => void;
  onLogout: () => void;
}

function getAdultMaxDate(): string {
  const today = new Date();
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return d.toISOString().split("T")[0];
}

function ageFromBirthDate(iso: string | undefined, fallback: number): number {
  if (!iso) return fallback;
  const d = new Date(iso + "T12:00:00");
  if (isNaN(d.getTime())) return fallback;
  const today = new Date();
  let a = today.getFullYear() - d.getFullYear();
  const md = today.getMonth() - d.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < d.getDate())) a -= 1;
  return a >= 0 ? a : fallback;
}

export function ProfileSettingsModal({
  onClose,
  onOpenSettings,
  onOpenQR,
  onLogout,
}: ProfileSettingsModalProps) {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    birthDate: user?.birthDate || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });
  const [interestTags, setInterestTags] = useState<string[]>(user?.interests || []);
  const [newInterest, setNewInterest] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.photo || "");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      email: user.email || "",
      birthDate: user.birthDate || "",
      location: user.location || "",
      bio: user.bio || "",
    });
    setInterestTags(user.interests || []);
    setAvatarUrl(user.photo || "");
  }, [user?.id]);

  const canSave = useMemo(
    () => !!form.name.trim() && !!form.email.trim() && !!form.birthDate.trim() && !!avatarUrl && !saving,
    [avatarUrl, form.birthDate, form.email, form.name, saving]
  );

  if (!user) return null;

  const displayName = (editing ? form.name : user.name).trim() || user.name;
  const displayAge = ageFromBirthDate(editing ? form.birthDate : user.birthDate, user.age);

  const handleUploadAvatar = async (file?: File) => {
    if (!file) return;
    const res = await uploadFile(file);
    if (!res.url) {
      setError(res.error || "Не удалось загрузить фото");
      return;
    }
    setAvatarUrl(res.url);
    setError(null);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const res = await updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate,
      location: form.location.trim(),
      bio: form.bio.trim(),
      avatarUrl,
      photos: [],
      interests: interestTags,
    });
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    await refreshUser();
    setEditing(false);
  };

  const addInterest = () => {
    const t = newInterest.trim();
    if (t && !interestTags.includes(t)) {
      setInterestTags((prev) => [...prev, t]);
      setNewInterest("");
    }
  };

  const removeInterest = (t: string) => {
    setInterestTags((prev) => prev.filter((x) => x !== t));
  };

  return (
    <ModalShell onClose={onClose} ariaLabel="Профиль" hideCloseButton>
      <div className="flex flex-col h-full">
        <div className="relative h-24 sm:h-28 flex-shrink-0 bg-gradient-to-br from-red-600 to-amber-500">
          <button
            type="button"
            onClick={onOpenQR}
            className="absolute left-3 top-3 z-10 rounded-lg bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
            aria-label="QR-код"
          >
            <QrCode className="size-5 text-white" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30"
            aria-label="Закрыть"
          >
            <X className="size-5 text-white" />
          </button>
          <div className="absolute -bottom-10 left-1/2 z-20 -translate-x-1/2">
            <div className="relative size-24 sm:size-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='%23e7e5e4'%3E%3Crect width='64' height='64'/%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="h-full w-full bg-stone-100" />
              )}
              {editing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="profile-avatar-upload"
                    onChange={(e) => void handleUploadAvatar(e.target.files?.[0])}
                  />
                  <label
                    htmlFor="profile-avatar-upload"
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 transition-colors hover:bg-black/60"
                  >
                    <Camera className="size-8 text-white" />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto modal-scroll pt-14 sm:pt-16 px-5 sm:px-6 pb-5 sm:pb-6">
          {editing ? (
            <div className="mb-6 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Имя</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Дата рождения</label>
                <input
                  type="date"
                  max={getAdultMaxDate()}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={form.birthDate}
                  onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Город</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <h2 className="mb-1 text-2xl font-bold text-gray-800">
                {displayName}, {displayAge}
              </h2>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                <MapPin className="size-4" />
                <span className="text-sm">{user.location || "Не указан город"}</span>
              </div>
            </div>
          )}

          {!editing && (
            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-amber-50 p-3 text-center">
                <Heart className="mx-auto mb-1 size-5 text-red-500" />
                <div className="text-lg font-bold text-gray-800">{profileStatsPlaceholder.likes}</div>
                <div className="text-xs text-gray-600">Лайки</div>
              </div>
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-amber-50 p-3 text-center">
                <Sparkles className="mx-auto mb-1 size-5 text-amber-500" />
                <div className="text-lg font-bold text-gray-800">{profileStatsPlaceholder.matches}</div>
                <div className="text-xs text-gray-600">Матчи</div>
              </div>
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-amber-50 p-3 text-center">
                <Cake className="mx-auto mb-1 size-5 text-orange-500" />
                <div className="text-lg font-bold text-gray-800">{displayAge}</div>
                <div className="text-xs text-gray-600">Лет</div>
              </div>
            </div>
          )}

          <div className="mb-6 mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">О себе</h3>
            </div>
            {editing ? (
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                rows={4}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Расскажите о себе..."
              />
            ) : (
              <p className="leading-relaxed text-gray-700">{user.bio || "Добавьте описание о себе"}</p>
            )}
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Интересы</h3>
            </div>
            {editing ? (
              <>
                <div className="mx-[0px] mb-[10px] mt-[0px] flex flex-wrap gap-1.5 sm:gap-2">
                  {interestTags.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="border-0 bg-gradient-to-r from-red-100 to-amber-100 text-xs leading-snug text-red-700 sm:text-sm"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInterest();
                      }
                    }}
                    placeholder="Добавить интерес..."
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    disabled={!newInterest.trim()}
                    className="rounded-xl bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </>
            ) : (
              <div className="mx-[0px] mb-[10px] mt-[0px] flex flex-wrap gap-1.5 sm:gap-2">
                {(user.interests || []).length > 0 ? (
                  (user.interests || []).map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="border-0 bg-gradient-to-r from-red-100 to-amber-100 text-xs leading-snug text-red-700 sm:text-sm"
                    >
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Добавьте интересы в режиме редактирования</span>
                )}
              </div>
            )}
          </div>

          {!editing && (
            <div className="mb-6">
              <h3 className="mb-3 font-semibold text-gray-800">Контакты</h3>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="size-5 text-red-500" />
                <span className="text-sm">{user.email || "Email не указан"}</span>
              </div>
            </div>
          )}

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          {editing ? (
            <div className="mb-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!canSave}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-amber-500 px-6 py-3 font-medium text-white transition-shadow hover:shadow-lg disabled:opacity-60"
              >
                <span>{saving ? "Сохраняем..." : "Сохранить"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  if (user) {
                    setForm({
                      name: user.name || "",
                      email: user.email || "",
                      birthDate: user.birthDate || "",
                      location: user.location || "",
                      bio: user.bio || "",
                    });
                    setInterestTags(user.interests || []);
                    setAvatarUrl(user.photo || "");
                  }
                }}
                className="flex items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span>Отмена</span>
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-amber-500 px-6 py-3 font-medium text-white transition-shadow hover:shadow-lg"
                >
                  <span>Редактировать</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span>Настройки</span>
                </button>
              </div>
              <button
                type="button"
                onClick={onOpenQR}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-medium text-white transition-shadow hover:shadow-lg"
              >
                <QrCode className="size-5 shrink-0" />
                <span>Поделиться QR-кодом</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600"
              >
                <LogOut className="size-5 shrink-0" />
                <span>Выйти</span>
              </button>
            </>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
