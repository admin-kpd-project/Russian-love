import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  activateUser,
  createAdminPublicUser,
  deactivateUser,
  getAdminMobileApk,
  getAdminStats,
  listAdminReports,
  listAdminTickets,
  patchAdminMobileApk,
  patchAdminReport,
  patchAdminTicket,
  type AdminReport,
  type AdminTicket,
} from "../services/adminService";
import { uploadMobileApkFile } from "../services/uploadService";
import { useAuth } from "../contexts/AuthContext";
import { loginByAdminCode } from "../services/authService";

const STAFF = ["admin", "moderator", "support"] as const;
const MOD = ["admin", "moderator"] as const;

/** ВРЕМЕННО: /admin без редиректа на логин. Перед продом — `false` и верни проверку ролей. */
const TEMP_ADMIN_NO_AUTH = true;

function canSeeReports(role: string | undefined) {
  return role && MOD.includes(role as (typeof MOD)[number]);
}

function isAuthDenied(error: string | null): boolean {
  if (!error) return false;
  const e = error.toLowerCase();
  return (
    e.includes("http 401") ||
    e.includes("http 403") ||
    e.includes("требуется вход") ||
    e.includes("not authenticated") ||
    e.includes("недостаточно прав")
  );
}

type AdminTab = "overview" | "apk" | "tickets" | "reports" | "users";

export function AdminPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "user";
  const isAdmin = TEMP_ADMIN_NO_AUTH || role === "admin";
  const canReportsTab = TEMP_ADMIN_NO_AUTH || canSeeReports(role);
  const [stats, setStats] = useState<{ openTickets: number; openReports: number } | null>(null);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [apkUpdatedAt, setApkUpdatedAt] = useState<string | null>(null);
  const [apkBusy, setApkBusy] = useState(false);
  const [apkErr, setApkErr] = useState<string | null>(null);
  const apkFileRef = useRef<HTMLInputElement>(null);
  const [cuEmail, setCuEmail] = useState("");
  const [cuPassword, setCuPassword] = useState("");
  const [cuName, setCuName] = useState("");
  const [cuRole, setCuRole] = useState<"user" | "admin" | "moderator" | "support">("user");
  const [cuBusy, setCuBusy] = useState(false);
  const [cuMsg, setCuMsg] = useState<string | null>(null);
  const [cuErr, setCuErr] = useState<string | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [adminCodeBusy, setAdminCodeBusy] = useState(false);
  const [adminCodeErr, setAdminCodeErr] = useState<string | null>(null);
  const [adminCodeMsg, setAdminCodeMsg] = useState<string | null>(null);

  const allowed = TEMP_ADMIN_NO_AUTH || STAFF.includes(role as (typeof STAFF)[number]);

  const refresh = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setErr(null);
    const s = await getAdminStats();
    if (s.error) {
      setErr(s.error);
      // If admin public mode is disabled and there is no valid session,
      // avoid cascading the same 401/403 errors for every tab request.
      if (isAuthDenied(s.error)) {
        setLoading(false);
        return;
      }
    }
    else if (s.data) setStats(s.data);
    const tk = await listAdminTickets();
    if (tk.data) setTickets(tk.data);
    if (canReportsTab) {
      const rp = await listAdminReports();
      if (rp.data) setReports(rp.data);
    } else {
      setReports([]);
    }
    setLoading(false);
  }, [allowed, role, canReportsTab]);

  const loadApk = useCallback(async () => {
    const r = await getAdminMobileApk();
    if (r.error) {
      setApkErr(r.error);
      return;
    }
    setApkErr(null);
    setApkUrl(r.data?.downloadUrl ?? null);
    setApkUpdatedAt(r.data?.updatedAt ?? null);
  }, []);

  useEffect(() => {
    if (tab === "apk" && isAdmin) void loadApk();
  }, [tab, isAdmin, loadApk]);

  useEffect(() => {
    if (TEMP_ADMIN_NO_AUTH) {
      void refresh();
      return;
    }
    if (authLoading) return;
    if (!user || !allowed) {
      navigate("/", { replace: true });
      return;
    }
    void refresh();
  }, [user, authLoading, allowed, navigate, refresh]);

  if (!TEMP_ADMIN_NO_AUTH && (authLoading || !user || !allowed)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <p className="text-stone-600">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Админ-панель</h1>
            <p className="text-sm text-stone-500">
              Роль: <span className="font-medium text-stone-700">{user?.role ?? "—"}</span>
              {TEMP_ADMIN_NO_AUTH ? (
                <span className="block text-amber-700 font-medium mt-1">
                  Временно: страница без входа; чтение обзора и создание пользователей — через публичные
                  эндпоинты API (см. DATING_ADMIN_PUBLIC_* в backend). APK в dev-режиме тоже можно загрузить
                  без JWT, если на backend включён DATING_ADMIN_PUBLIC_PANEL=true.
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-sm font-medium shadow-sm"
            >
              Обновить
            </button>
            <Link
              to="/app"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white text-sm font-medium"
            >
              В приложение
            </Link>
          </div>
        </div>
        {TEMP_ADMIN_NO_AUTH && (!user || role !== "admin") ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-amber-900 font-medium mb-2">
              Временный вход в админку по коду
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="password"
                placeholder="Код доступа"
                className="border rounded-lg px-3 py-2 text-sm min-w-[220px]"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                disabled={adminCodeBusy}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium disabled:opacity-50"
                onClick={async () => {
                  const code = adminCode.trim();
                  setAdminCodeErr(null);
                  setAdminCodeMsg(null);
                  if (!code) {
                    setAdminCodeErr("Введите код доступа.");
                    return;
                  }
                  setAdminCodeBusy(true);
                  const r = await loginByAdminCode({ code });
                  if (r.error || !r.data) {
                    setAdminCodeErr(r.error || "Не удалось авторизоваться.");
                    setAdminCodeBusy(false);
                    return;
                  }
                  await refreshUser();
                  setAdminCodeBusy(false);
                  setAdminCodeMsg("Вы вошли как admin. Можно обновить данные админки.");
                  setAdminCode("");
                  void refresh();
                }}
              >
                {adminCodeBusy ? "Вход..." : "Войти как admin"}
              </button>
            </div>
            {adminCodeErr ? <p className="text-xs text-red-600 mt-2">{adminCodeErr}</p> : null}
            {adminCodeMsg ? <p className="text-xs text-green-700 mt-2">{adminCodeMsg}</p> : null}
          </div>
        ) : null}

        {err && <p className="mb-4 text-red-600 text-sm">{err}</p>}

        <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === "overview" ? "bg-red-600 text-white" : "bg-white text-stone-700 border border-stone-200"
            }`}
          >
            Обзор
          </button>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setTab("apk")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tab === "apk" ? "bg-red-600 text-white" : "bg-white text-stone-700 border border-stone-200"
              }`}
            >
              APK (лендинг)
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === "users" ? "bg-red-600 text-white" : "bg-white text-stone-700 border border-stone-200"
            }`}
          >
            Создать пользователя
          </button>
          <button type="button" onClick={() => setTab("tickets")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "tickets" ? "bg-red-600 text-white" : "bg-white text-stone-700 border border-stone-200"}`}>
            Обращения
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canReportsTab) return;
              setTab("reports");
            }}
            disabled={!canReportsTab}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === "reports" ? "bg-red-600 text-white" : "bg-white text-stone-700 border border-stone-200"
            } disabled:opacity-40`}
          >
            Жалобы
          </button>
        </div>

        {loading ? (
          <p className="text-stone-600">Загрузка данных…</p>
        ) : tab === "users" ? (
          <div className="bg-white rounded-2xl p-6 shadow border border-stone-100 max-w-lg">
            <h2 className="text-lg font-bold text-stone-900 mb-2">Новый пользователь</h2>
            <p className="text-sm text-stone-600 mb-4">
              Email и пароль для входа. Роль <span className="font-medium">admin / moderator / support</span> — для
              доступа к защищённым действиям в этой панели после входа.
            </p>
            {cuErr ? <p className="text-red-600 text-sm mb-3">{cuErr}</p> : null}
            {cuMsg ? <p className="text-green-700 text-sm mb-3">{cuMsg}</p> : null}
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              value={cuEmail}
              onChange={(e) => setCuEmail(e.target.value)}
              autoComplete="off"
            />
            <label className="block text-sm font-medium text-stone-700 mb-1">Пароль (мин. 6 символов)</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              value={cuPassword}
              onChange={(e) => setCuPassword(e.target.value)}
              autoComplete="new-password"
            />
            <label className="block text-sm font-medium text-stone-700 mb-1">Имя</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              value={cuName}
              onChange={(e) => setCuName(e.target.value)}
            />
            <label className="block text-sm font-medium text-stone-700 mb-1">Роль</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
              value={cuRole}
              onChange={(e) => setCuRole(e.target.value as typeof cuRole)}
            >
              <option value="user">user</option>
              <option value="support">support</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
            <button
              type="button"
              disabled={cuBusy}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white text-sm font-medium disabled:opacity-50"
              onClick={async () => {
                setCuErr(null);
                setCuMsg(null);
                const email = cuEmail.trim();
                const name = cuName.trim();
                if (!email || !cuPassword || cuPassword.length < 6 || !name) {
                  setCuErr("Заполните email, имя и пароль (не короче 6 символов).");
                  return;
                }
                setCuBusy(true);
                const r = await createAdminPublicUser({
                  email,
                  password: cuPassword,
                  name,
                  role: cuRole,
                });
                setCuBusy(false);
                if (r.error) {
                  setCuErr(r.error);
                  return;
                }
                setCuMsg(`Создан: ${email}, роль ${cuRole}. Можно войти на сайте с этим email и паролем.`);
                setCuPassword("");
              }}
            >
              {cuBusy ? "Создание…" : "Создать"}
            </button>
          </div>
        ) : tab === "apk" && isAdmin ? (
          <div className="bg-white rounded-2xl p-6 shadow border border-stone-100 max-w-2xl">
            <h2 className="text-lg font-bold text-stone-900 mb-2">APK для главной страницы</h2>
            <p className="text-sm text-stone-600 mb-4">
              Загрузите файл — он попадёт в хранилище, а публичная ссылка появится на лендинге (кнопка с иконкой телефона и блок «Приложение для Android»).
            </p>
            {apkErr ? <p className="text-red-600 text-sm mb-3">{apkErr}</p> : null}
            <p className="text-xs text-stone-500 mb-1">Текущая ссылка</p>
            <p className="text-sm font-mono break-all text-stone-800 mb-1">{apkUrl || "— не задана —"}</p>
            {apkUpdatedAt ? <p className="text-xs text-stone-400 mb-4">Обновлено: {apkUpdatedAt}</p> : <div className="mb-4" />}
            <input ref={apkFileRef} type="file" accept=".apk,application/vnd.android.package-archive" className="block w-full text-sm mb-4" />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={apkBusy}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white text-sm font-medium disabled:opacity-50"
                onClick={async () => {
                  const f = apkFileRef.current?.files?.[0];
                  if (!f) {
                    setApkErr("Выберите файл .apk");
                    return;
                  }
                  setApkBusy(true);
                  setApkErr(null);
                  const up = await uploadMobileApkFile(f, TEMP_ADMIN_NO_AUTH && !user);
                  if (!up.url) {
                    setApkErr(up.error || "Не удалось загрузить APK");
                    setApkBusy(false);
                    return;
                  }
                  const p = await patchAdminMobileApk(up.url);
                  if (p.error) setApkErr(p.error);
                  else await loadApk();
                  setApkBusy(false);
                }}
              >
                {apkBusy ? "Загрузка…" : "Загрузить и опубликовать"}
              </button>
              <button
                type="button"
                disabled={apkBusy}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-800 text-sm font-medium disabled:opacity-50"
                onClick={async () => {
                  if (!confirm("Убрать ссылку на APK с лендинга?")) return;
                  setApkBusy(true);
                  setApkErr(null);
                  const p = await patchAdminMobileApk(null);
                  if (p.error) setApkErr(p.error);
                  else await loadApk();
                  setApkBusy(false);
                }}
              >
                Сбросить ссылку
              </button>
            </div>
          </div>
        ) : tab === "overview" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow border border-stone-100">
              <p className="text-sm text-stone-500">Открытые обращения</p>
              <p className="text-3xl font-bold text-stone-900">{stats?.openTickets ?? 0}</p>
            </div>
            {canReportsTab ? (
              <div className="bg-white rounded-2xl p-6 shadow border border-stone-100">
                <p className="text-sm text-stone-500">Открытые жалобы</p>
                <p className="text-3xl font-bold text-stone-900">{stats?.openReports ?? 0}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow border border-stone-100 text-stone-500 text-sm">
                Раздел жалоб доступен модераторам и администраторам.
              </div>
            )}
          </div>
        ) : tab === "tickets" ? (
          <ul className="space-y-4">
            {tickets.map((t) => (
              <li key={t.id} className="bg-white rounded-2xl p-4 shadow border border-stone-100">
                <div className="flex justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900">{t.subject}</span>
                  <select
                    value={t.status}
                    onChange={async (e) => {
                      const status = e.target.value as "open" | "in_progress" | "closed";
                      const r = await patchAdminTicket(t.id, { status });
                      if (!r.error) void refresh();
                    }}
                    className="border rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
                <p className="text-sm text-stone-600 mt-2 whitespace-pre-wrap">{t.message}</p>
                <p className="text-xs text-stone-400 mt-1">user: {t.userId}</p>
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Ответ пользователю"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    defaultValue={t.staffReply ?? ""}
                    id={`reply-${t.id}`}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm"
                    onClick={async () => {
                      const el = document.getElementById(`reply-${t.id}`) as HTMLInputElement | null;
                      const staffReply = el?.value?.trim() ?? "";
                      await patchAdminTicket(t.id, { staffReply });
                      void refresh();
                    }}
                  >
                    Сохранить ответ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          canReportsTab && (
            <ul className="space-y-4">
              {reports.map((r) => (
                <li key={r.id} className="bg-white rounded-2xl p-4 shadow border border-stone-100">
                  <p className="text-sm text-stone-500">
                    На пользователя <span className="font-mono text-xs">{r.reportedUserId}</span>
                  </p>
                  <p className="text-stone-800 mt-2 whitespace-pre-wrap">{r.reason}</p>
                  <p className="text-xs text-stone-400 mt-1">от {r.reporterId}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <select
                      value={r.status}
                      onChange={async (e) => {
                        const st = e.target.value as "open" | "resolved" | "dismissed";
                        await patchAdminReport(r.id, st);
                        void refresh();
                      }}
                      className="border rounded-lg px-2 py-1 text-sm"
                    >
                      <option value="open">open</option>
                      <option value="resolved">resolved</option>
                      <option value="dismissed">dismissed</option>
                    </select>
                    {canReportsTab && user?.role !== "support" && (
                      <>
                        <button
                          type="button"
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                          onClick={async () => {
                            if (confirm("Заблокировать пользователя?")) {
                              await deactivateUser(r.reportedUserId);
                              void refresh();
                            }
                          }}
                        >
                          Заблокировать
                        </button>
                        {role === "admin" && (
                          <button
                            type="button"
                            className="px-3 py-1 bg-green-700 text-white rounded-lg text-sm"
                            onClick={async () => {
                              await activateUser(r.reportedUserId);
                              void refresh();
                            }}
                          >
                            Разблокировать (admin)
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
