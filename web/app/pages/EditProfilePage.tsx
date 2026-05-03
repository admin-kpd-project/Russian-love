import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Camera, Save } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../services/usersService";
import { uploadFile } from "../services/uploadService";

function getAdultMaxDate(): string {
  const today = new Date();
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return d.toISOString().split("T")[0];
}

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState(user?.photo || "");
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    birthDate: user?.birthDate || "",
    gender: user?.gender || "",
    bio: user?.bio || "",
    interests: (user?.interests || []).join(", "),
  });

  const canSubmit = useMemo(
    () => !!form.name.trim() && !!form.email.trim() && !!form.birthDate.trim() && !!avatarUrl && !submitting,
    [avatarUrl, form.birthDate, form.email, form.name, submitting]
  );

  const handleUploadAvatar = async (file?: File) => {
    if (!file) return;
    const res = await uploadFile(file);
    if (!res.url) return setError(res.error || "Не удалось загрузить фото");
    setAvatarUrl(res.url);
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate,
      bio: form.bio.trim() || "",
      avatarUrl,
      photos: [],
      interests: form.interests
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    await refreshUser();
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50 p-4">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Редактирование профиля</h1>
        <p className="mt-1 text-sm text-gray-600">Пол нельзя изменить в приложении. Для изменения обратитесь в поддержку.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Основное фото *</label>
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-4 text-gray-600 hover:bg-gray-50">
              <Camera className="size-5" />
              <span>{avatarUrl ? "Фото загружено" : "Загрузить фото"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleUploadAvatar(e.target.files?.[0])} />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Имя *</label>
            <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input type="email" autoComplete="email" className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Дата рождения</label>
            <input
              type="date"
              max={getAdultMaxDate()}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3"
              value={form.birthDate}
              onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Пол</label>
            <input className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500" value={form.gender || "Не указан"} readOnly />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">О себе</label>
            <textarea className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3" rows={3} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Интересы (через запятую)</label>
            <input className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3" value={form.interests} onChange={(e) => setForm((p) => ({ ...p, interests: e.target.value }))} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            <Save className="size-4" />
            {submitting ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </div>
  );
}
