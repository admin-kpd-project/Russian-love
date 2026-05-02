import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  activateUser,
  deactivateUser,
  getAdminStats,
  listAdminReports,
  listAdminTickets,
  patchAdminReport,
  patchAdminTicket,
  type AdminReport,
  type AdminTicket,
} from "../services/adminService";
import { useAuth } from "../contexts/AuthContext";

const STAFF = ["admin", "moderator", "support"] as const;
const MOD = ["admin", "moderator"] as const;

function canSeeReports(role: string | undefined) {
  return role && MOD.includes(role as (typeof MOD)[number]);
}

export function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "user";
  const [stats, setStats] = useState<{ openTickets: number; openReports: number } | null>(null);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [tab, setTab] = useState<"overview" | "tickets" | "reports">("overview");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const allowed = STAFF.includes(role as (typeof STAFF)[number]);

  const refresh = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setErr(null);
    const s = await getAdminStats();
    const tk = await listAdminTickets();
    if (s.error) setErr(s.error);
    else if (s.data) setStats(s.data);
    if (tk.data) setTickets(tk.data);
    if (canSeeReports(role)) {
      const rp = await listAdminReports();
      if (rp.data) setReports(rp.data);
    } else {
      setReports([]);
    }
    setLoading(false);
  }, [allowed, role]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !allowed) {
      navigate("/", { replace: true });
      return;
    }
    void refresh();
  }, [user, authLoading, allowed, navigate, refresh]);

  if (authLoading || !user || !allowed) {
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
              Роль: <span className="font-medium text-stone-700">{role}</span>
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

        {err && <p className="mb-4 text-red-600 text-sm">{err}</p>}

        <div className="flex gap-2 mb-6 border-b border-stone-200 pb-2">
          {(["overview", "tickets", "reports"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                if (t === "reports" && !canSeeReports(role)) return;
                setTab(t);
              }}
              disabled={t === "reports" && !canSeeReports(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tab === t ? "bg-red-600 text-white" : "bg-white text-stone-700 border border-stone-200"
              } disabled:opacity-40`}
            >
              {t === "overview" ? "Обзор" : t === "tickets" ? "Обращения" : "Жалобы"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-stone-600">Загрузка данных…</p>
        ) : tab === "overview" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow border border-stone-100">
              <p className="text-sm text-stone-500">Открытые обращения</p>
              <p className="text-3xl font-bold text-stone-900">{stats?.openTickets ?? 0}</p>
            </div>
            {canSeeReports(role) ? (
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
          canSeeReports(role) && (
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
                    {canSeeReports(role) && role !== "support" && (
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
