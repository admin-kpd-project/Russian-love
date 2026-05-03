import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, CheckCheck, Trash2, Check } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

import type { OpenChatParams } from "../types/chat";
import {
  getConversations,
  markConversationsRead,
  deleteConversation,
} from "../services/conversationsService";
import { ModalShell } from "./ui/modal-shell";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface ChatsListProps {
  onClose: () => void;
  onOpenChat: (params: OpenChatParams) => void;
}

function formatListTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return formatDistanceToNow(d, { addSuffix: true, locale: ru });
  } catch {
    return iso;
  }
}

export function ChatsList({ onClose, onOpenChat }: ChatsListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await getConversations();
    setLoading(false);
    if (res.error) {
      setLoadError(res.error);
      setChats([]);
      return;
    }
    const rows = res.data ?? [];
    setChats(
      rows.map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar || "",
        lastMessage: c.lastMessage || "",
        timestamp: formatListTimestamp(c.timestamp),
        unread: c.unread,
      }))
    );
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const unreadCount = chats.filter((c) => c.unread).length;

  const markAllAsRead = async () => {
    if (chats.length === 0) return;
    setActionBusy(true);
    setLoadError(null);
    const res = await markConversationsRead({ all: true });
    if (res.error) {
      setActionBusy(false);
      setLoadError(res.error);
      return;
    }
    setActionBusy(false);
    await loadConversations();
  };

  const toggleSelection = (chatId: string) => {
    setSelectedChats(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const deleteSelectedChats = async () => {
    if (selectedChats.length === 0) {
      setShowDeleteConfirm(false);
      return;
    }
    setActionBusy(true);
    setLoadError(null);
    for (const id of selectedChats) {
      const res = await deleteConversation(id);
      if (res.error) {
        setActionBusy(false);
        setLoadError(res.error);
        return;
      }
    }
    setActionBusy(false);
    setShowDeleteConfirm(false);
    setSelectedChats([]);
    setSelectionMode(false);
    await loadConversations();
  };

  const deleteAllChats = async () => {
    if (chats.length === 0) {
      setShowClearAllConfirm(false);
      return;
    }
    setActionBusy(true);
    setLoadError(null);
    for (const chat of chats) {
      const res = await deleteConversation(chat.id);
      if (res.error) {
        setActionBusy(false);
        setLoadError(res.error);
        return;
      }
    }
    setActionBusy(false);
    setShowClearAllConfirm(false);
    await loadConversations();
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedChats([]);
  };

  return (
    <ModalShell onClose={onClose} ariaLabel="Личные чаты" variant="sheet">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 px-5 sm:px-6 py-4 text-white flex-shrink-0 pr-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2 rounded-full">
              <MessageCircle className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">
                {selectionMode ? `Выбрано: ${selectedChats.length}` : "Личные чаты"}
              </h2>
              <p className="text-white/80 text-xs">
                {selectionMode
                  ? `из ${chats.length} чатов`
                  : unreadCount === 0
                    ? "Нет непрочитанных"
                    : `${unreadCount} непрочитанных`}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          {!selectionMode ? (
            <div className="space-y-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={loading || actionBusy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-colors text-sm font-medium"
                >
                  <CheckCheck className="size-4" />
                  {actionBusy ? "…" : "Отметить все прочитанными"}
                </button>
              )}
              {chats.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectionMode(true)}
                    disabled={loading || actionBusy}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-colors text-sm font-medium"
                  >
                    <Check className="size-4" />
                    Выбрать
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearAllConfirm(true)}
                    disabled={loading || actionBusy}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-colors text-sm font-medium"
                  >
                    <Trash2 className="size-4" />
                    Очистить все
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exitSelectionMode}
                disabled={actionBusy}
                className="flex-1 px-4 py-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-xl transition-colors text-sm font-medium"
              >
                Отмена
              </button>
              {selectedChats.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={actionBusy}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/30 hover:bg-white/40 disabled:opacity-50 rounded-xl transition-colors text-sm font-medium"
                >
                  <Trash2 className="size-4" />
                  Удалить ({selectedChats.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chats List */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll">
          {loading ? (
            <div className="p-12 text-center text-gray-500 text-sm">Загрузка…</div>
          ) : loadError ? (
            <div className="p-8 text-center text-red-600 text-sm">{loadError}</div>
          ) : chats.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    if (selectionMode) {
                      toggleSelection(chat.id);
                    } else {
                      onOpenChat({
                        userName: chat.name,
                        userAvatar: chat.avatar,
                        conversationId: chat.id,
                      });
                      onClose();
                    }
                  }}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 text-left cursor-pointer ${
                    selectedChats.includes(chat.id) ? 'bg-red-50' : ''
                  }`}
                >
                  {selectionMode && (
                    <div className="flex items-center flex-shrink-0 pt-2">
                      <div
                        className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedChats.includes(chat.id)
                            ? 'bg-gradient-to-r from-red-600 to-amber-500 border-red-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {selectedChats.includes(chat.id) && (
                          <Check className="size-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="size-14 rounded-full object-cover"
                    />
                    {chat.unread && (
                      <span className="absolute top-0 right-0 size-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className={`font-semibold ${chat.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2">
                        {chat.timestamp}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${chat.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 w-fit mx-auto mb-4">
                <MessageCircle className="size-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Пока нет чатов
              </h3>
              <p className="text-gray-500 text-sm">
                Начните листать профили и находить совпадения!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-4">
                  <Trash2 className="size-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Удалить чаты</h3>
                <p className="text-sm text-gray-600">
                  Вы уверены, что хотите удалить выбранные чаты ({selectedChats.length})?
                  Это действие нельзя отменить.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => void deleteSelectedChats()}
                  disabled={actionBusy}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-2xl font-medium hover:shadow-lg disabled:opacity-50 transition-shadow"
                >
                  {actionBusy ? "…" : "Удалить"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Dialog */}
      <AnimatePresence>
        {showClearAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowClearAllConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="bg-red-100 rounded-full p-4 w-fit mx-auto mb-4">
                  <Trash2 className="size-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Очистить все чаты</h3>
                <p className="text-sm text-gray-600">
                  Вы уверены, что хотите удалить все чаты ({chats.length})?
                  Все сообщения будут безвозвратно удалены.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => void deleteAllChats()}
                  disabled={actionBusy}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-2xl font-medium hover:shadow-lg disabled:opacity-50 transition-shadow"
                >
                  {actionBusy ? "…" : "Удалить всё"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
}