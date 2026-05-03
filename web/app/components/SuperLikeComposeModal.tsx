import { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";
import { ModalShell } from "./ui/modal-shell";
import { normalizeAssetUrlForHttps } from "../utils/mediaUrl";

const MAX = 500;

type Props = {
  open: boolean;
  peerName: string;
  peerPhoto?: string;
  onClose: () => void;
  onSend: (message: string | undefined) => void;
};

export function SuperLikeComposeModal({ open, peerName, peerPhoto, onClose, onSend }: Props) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell onClose={onClose} ariaLabel="Сообщение к суперлайку" disableBackdropClose>
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="flex-shrink-0 bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-4 pr-14 text-white">
          <div className="flex items-center gap-2">
            <Star className="size-5 fill-white text-white" />
            <h2 className="text-lg font-bold">Суперлайк</h2>
          </div>
          <p className="mt-1 text-sm text-white/90">
            Можно добавить одно короткое сообщение для {peerName}. Переписка откроется только после взаимного мэтча.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto modal-scroll p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3">
            {peerPhoto ? (
              <img
                src={normalizeAssetUrlForHttps(peerPhoto)}
                alt=""
                className="size-14 shrink-0 rounded-xl object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-sky-200/80 text-sky-800">
                <Star className="size-7 fill-white text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{peerName}</p>
              <p className="text-xs text-sky-900/80">Сообщение не попадёт в чат до мэтча — его увидят в уведомлении.</p>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-medium text-gray-500">Сообщение (необязательно)</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              rows={5}
              maxLength={MAX}
              placeholder="Например: привет, у нас общие интересы!"
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none ring-sky-400 focus:border-sky-300 focus:bg-white focus:ring-2"
            />
            <span className="mt-1 block text-right text-[11px] text-gray-400">
              {text.length}/{MAX}
            </span>
          </label>
        </div>

        <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => onSend(text.trim() || undefined)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95"
            >
              <Send className="size-4" />
              Отправить суперлайк
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
