import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Headphones, Send } from "lucide-react";
import { createSupportTicket, listMySupportTickets, type SupportTicket } from "../services/supportUserService";

export function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const load = async () => {
    setLoading(true);
    const r = await listMySupportTickets();
    setLoading(false);
    if (r.data) setTickets(r.data);
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(false);
    if (!subject.trim() || !message.trim()) {
      setErr("Заполните тему и сообщение");
      return;
    }
    setSending(true);
    const r = await createSupportTicket(subject.trim(), message.trim());
    setSending(false);
    if (r.error) {
      setErr(r.error);
      return;
    }
    setOk(true);
    setSubject("");
    setMessage("");
    void load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-red-600 mb-6"
        >
          <ArrowLeft className="size-4" />
          В приложение
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-amber-500 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Headphones className="size-10" />
              <h1 className="text-2xl font-bold">Поддержка</h1>
            </div>
            <p className="text-white/90 text-sm">
              Опишите проблему — команда ответит в рамках обращения в админ-панели.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Тема</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Кратко"
                  maxLength={500}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Сообщение</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none resize-y"
                  placeholder="Подробности"
                  maxLength={8000}
                />
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
              {ok && <p className="text-sm text-green-600">Обращение отправлено.</p>}
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="size-5" />
                {sending ? "Отправка…" : "Отправить"}
              </button>
            </form>

            <div className="border-t border-stone-200 pt-6">
              <h2 className="font-semibold text-stone-800 mb-3">Мои обращения</h2>
              {loading ? (
                <p className="text-stone-500 text-sm">Загрузка…</p>
              ) : tickets.length === 0 ? (
                <p className="text-stone-500 text-sm">Пока нет обращений.</p>
              ) : (
                <ul className="space-y-3">
                  {tickets.map((t) => (
                    <li key={t.id} className="rounded-xl border border-stone-200 p-4 bg-stone-50/80">
                      <div className="flex justify-between gap-2 mb-1">
                        <span className="font-medium text-stone-800">{t.subject}</span>
                        <span className="text-xs uppercase text-stone-500">{t.status}</span>
                      </div>
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">{t.message}</p>
                      {t.staffReply ? (
                        <p className="mt-2 text-sm text-green-800 bg-green-50 rounded-lg p-2">
                          <span className="font-medium">Ответ: </span>
                          {t.staffReply}
                        </p>
                      ) : null}
                      <p className="text-xs text-stone-400 mt-2">{new Date(t.createdAt).toLocaleString("ru-RU")}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
